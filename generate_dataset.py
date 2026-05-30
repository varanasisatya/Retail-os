import csv
import random
from datetime import date, timedelta

# Configuration
START_DATE = date(2024, 6, 1)
END_DATE = date(2026, 5, 30)
DAYS = (END_DATE - START_DATE).days + 1

CATEGORIES = {
    "Electronics": [
        {"name": "Smart Pro Watch", "price": 199.99, "margin": 0.45},
        {"name": "Neural Headset", "price": 299.99, "margin": 0.50}
    ],
    "Apparel": [
        {"name": "AeroFit Runner Tee", "price": 34.99, "margin": 0.60},
        {"name": "Holo-Knit Hoodie", "price": 79.99, "margin": 0.55}
    ],
    "Home & Kitchen": [
        {"name": "EcoTemp Thermostat", "price": 129.99, "margin": 0.40}
    ],
    "Beauty": [
        {"name": "GlowSerum v2", "price": 49.99, "margin": 0.70}
    ],
    "Sports": [
        {"name": "Apex Yoga Mat", "price": 39.99, "margin": 0.65}
    ]
}

REGIONS = ["North America", "EMEA", "APAC", "Latin America"]

def run_generation():
    random.seed(42)  # For deterministic reproducibility
    rows = []
    
    # Initialize inventory tracking state per product per region
    # Format: {(product_name, region): current_inventory}
    inventory_state = {}
    for cat, items in CATEGORIES.items():
        for item in items:
            for region in REGIONS:
                inventory_state[(item["name"], region)] = random.randint(300, 800)

    # Date loop
    for day_offset in range(DAYS):
        current_date = START_DATE + timedelta(days=day_offset)
        day_str = current_date.isoformat()
        is_weekend = current_date.weekday() in (5, 6) # Sat, Sun
        
        # Determine seasonal event flags & baseline multipliers
        seasonal_flag = "None"
        season_mult = 1.0
        
        month, day = current_date.month, current_date.day
        
        # Holiday season (Nov 20 to Dec 24)
        if (month == 11 and day >= 20) or (month == 12 and day <= 24):
            seasonal_flag = "Holiday Season"
            season_mult = 1.6
            if month == 11 and current_date.weekday() == 4 and day >= 23 and day <= 29:
                seasonal_flag = "Black Friday"
                season_mult = 2.8
        # Summer Sale (July 1 to July 15)
        elif month == 7 and day <= 15:
            seasonal_flag = "Summer Sale"
            season_mult = 1.3
        # New Year (Dec 28 to Jan 3)
        elif (month == 12 and day >= 28) or (month == 1 and day <= 3):
            seasonal_flag = "New Year Promo"
            season_mult = 1.2
            
        # Loop products and regions
        for cat, items in CATEGORIES.items():
            for item in items:
                prod_name = item["name"]
                base_price = item["price"]
                margin_rate = item["margin"]
                
                for region in REGIONS:
                    # Regional multipliers
                    reg_mult = 1.0
                    if region == "North America":
                        reg_mult = 1.25
                    elif region == "APAC":
                        reg_mult = 1.10
                    elif region == "EMEA":
                        reg_mult = 0.95
                    else: # Latin America
                        reg_mult = 0.70
                        
                    # Base target units per product
                    if cat == "Electronics":
                        base_units = 15
                    elif cat == "Apparel":
                        base_units = 25
                    elif cat == "Home & Kitchen":
                        base_units = 10
                    elif cat == "Beauty":
                        base_units = 18
                    else: # Sports
                        base_units = 12
                        
                    # Weekend bump
                    wk_mult = 1.25 if is_weekend else 0.90
                    
                    # 1. SPECIAL EVENTS & ANOMALIES
                    viral_mult = 1.0
                    # Viral Surge: "Neural Headset" in APAC goes viral from Sep 10, 2025 to Oct 5, 2025
                    if prod_name == "Neural Headset" and region == "APAC":
                        if date(2025, 9, 10) <= current_date <= date(2025, 10, 5):
                            viral_mult = 6.5
                            if seasonal_flag == "None":
                                seasonal_flag = "Viral Surge"
                                
                    # 2. DISCOUNTS & MARKETING SPEND
                    discount_pct = 0.0
                    if seasonal_flag == "Black Friday":
                        discount_pct = round(random.uniform(0.20, 0.40), 2)
                    elif seasonal_flag == "Holiday Season":
                        discount_pct = round(random.uniform(0.10, 0.20), 2)
                    elif seasonal_flag == "Summer Sale":
                        discount_pct = round(random.uniform(0.15, 0.25), 2)
                    elif random.random() < 0.08:  # Random flash sales
                        discount_pct = round(random.uniform(0.05, 0.15), 2)
                        
                    # Marketing spend
                    marketing_spend = round(random.uniform(20, 80), 2)
                    if seasonal_flag in ("Black Friday", "Holiday Season"):
                        marketing_spend = round(random.uniform(150, 450), 2)
                    elif discount_pct > 0:
                        marketing_spend = round(random.uniform(80, 180), 2)
                        
                    # Discount impact on units
                    promo_mult = 1.0 + (discount_pct * 2.5) + (marketing_spend * 0.001)
                    
                    # Calculate target quantity sold
                    noise = random.gauss(1.0, 0.12)
                    qty_sold = int(base_units * reg_mult * season_mult * wk_mult * promo_mult * viral_mult * noise)
                    qty_sold = max(0, qty_sold)
                    
                    # 3. STOCKOUT / INVENTORY SHORTAGE ANOMALY
                    # Inventory Shortage: "Smart Pro Watch" in EMEA goes out of stock from Jan 5, 2026 to Jan 22, 2026
                    is_stockout_period = False
                    if prod_name == "Smart Pro Watch" and region == "EMEA":
                        if date(2026, 1, 5) <= current_date <= date(2026, 1, 22):
                            is_stockout_period = True
                            
                    # Retrieve inventory state
                    curr_inv = inventory_state[(prod_name, region)]
                    
                    # Force inventory to 0 during stockout anomaly
                    if is_stockout_period:
                        curr_inv = 0
                        qty_sold = 0
                        seasonal_flag = "Inventory Shortage"
                    else:
                        # Periodic replenishment (every 14 days or if stock falls below 40)
                        if day_offset % 14 == 0 or curr_inv < 40:
                            curr_inv += random.randint(300, 600)
                            
                        # Adjust quantity based on available stock
                        if qty_sold > curr_inv:
                            qty_sold = curr_inv
                            curr_inv = 0
                        else:
                            curr_inv -= qty_sold
                            
                    # Update inventory state
                    inventory_state[(prod_name, region)] = curr_inv
                    
                    # 4. REVENUE, PROFIT & METRICS
                    selling_price = base_price * (1.0 - discount_pct)
                    revenue = round(qty_sold * selling_price, 2)
                    
                    # Cost of goods sold (COGS)
                    cogs = qty_sold * base_price * (1.0 - margin_rate)
                    # Profit (subtracting marketing cost allocated)
                    profit = round(revenue - cogs - (marketing_spend / len(REGIONS)), 2)
                    
                    # Customer rating
                    customer_rating = round(random.uniform(4.0, 5.0), 1)
                    if discount_pct >= 0.30:  # customers love deep discounts
                        customer_rating = min(5.0, customer_rating + 0.2)
                    if is_stockout_period:
                        customer_rating = 0.0
                    elif qty_sold == 0 and not is_stockout_period:
                        customer_rating = 3.5  # poor review for stock issues
                        
                    rows.append({
                        "Date": day_str,
                        "Product Name": prod_name,
                        "Category": cat,
                        "Region": region,
                        "Quantity Sold": qty_sold,
                        "Revenue": revenue,
                        "Profit": profit,
                        "Inventory Level": curr_inv,
                        "Marketing Spend": marketing_spend,
                        "Customer Rating": customer_rating,
                        "Discount Percentage": round(discount_pct * 100, 1),
                        "Seasonal Event Flag": seasonal_flag
                    })
                    
    # Write dataset to CSV
    filename = "retail_synthetic_dataset.csv"
    fields = [
        "Date", "Product Name", "Category", "Region", "Quantity Sold",
        "Revenue", "Profit", "Inventory Level", "Marketing Spend",
        "Customer Rating", "Discount Percentage", "Seasonal Event Flag"
    ]
    
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
        
    print(f"Dataset generated successfully with {len(rows)} rows.")

if __name__ == "__main__":
    run_generation()
