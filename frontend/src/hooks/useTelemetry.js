import { useState, useEffect, useCallback, useRef } from 'react';

export const useTelemetry = (wsUrl) => {
    const [status, setStatus] = useState('DISCONNECTED');
    const [pipelineProgress, setPipelineProgress] = useState(null);
    const [intelligenceData, setIntelligenceData] = useState(null);
    
    const wsRef = useRef(null);
    const reconnectAttempts = useRef(0);
    const maxBackoffDelay = 30000;

    const connect = useCallback(() => {
        console.log(`[WebSocket] Connecting to: ${wsUrl}`);
        setStatus('CONNECTING');
        
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("[WebSocket] Connection verified and active.");
            setStatus('CONNECTED');
            reconnectAttempts.current = 0;
        };
        
        ws.onmessage = (event) => {
            const frame = JSON.parse(event.data);
            if (frame.event_type === 'PIPELINE_PROGRESS') {
                setPipelineProgress(frame.data);
            } else if (frame.event_type === 'INTELLIGENCE_UPDATE_COMPLETE') {
                setIntelligenceData(frame.payload);
                setPipelineProgress(null);
            }
        };

        ws.onclose = () => {
            setStatus('DISCONNECTED');
            wsRef.current = null;
            
            const backoffDelay = Math.min(
                Math.pow(2, reconnectAttempts.current) * 2000 + Math.random() * 1000, 
                maxBackoffDelay
            );
            
            reconnectAttempts.current += 1;
            setTimeout(() => { connect(); }, backoffDelay);
        };

        ws.onerror = (error) => {
            console.error("[WebSocket] Fault detected:", error);
            ws.close();
        };
    }, [wsUrl]);

    useEffect(() => {
        connect();
        return () => {
            if (wsRef.current) {
                wsRef.current.onclose = null;
                wsRef.current.close();
            }
        };
    }, [connect]);

    return { status, pipelineProgress, intelligenceData };
};
