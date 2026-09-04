import streamlit as st
import requests
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime

st.set_page_config(page_title="Financial Control Tower", layout="wide")

st.title("🏦 Financial Control Tower")
st.markdown("---")

API_URL = "http://localhost:8000"

col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric("Total Transactions", "1,234")
with col2:
    st.metric("Risk Score", "0.35", delta="-0.05")
with col3:
    st.metric("Active Alerts", "7", delta="-2")
with col4:
    st.metric("Pending Actions", "3")

st.markdown("---")

tab1, tab2, tab3, tab4 = st.tabs(["📊 Dashboard", "🚨 Alerts", "💡 Recommendations", "📋 Audit Trail"])

with tab1:
    st.subheader("Cash Flow Overview")
    
    dates = pd.date_range(end=datetime.now(), periods=30, freq='D')
    balance = [100000]
    for i in range(29):
        balance.append(balance[-1] + random.uniform(-5000, 8000))
    
    fig = px.line(x=dates, y=balance, title="Balance Over Time")
    fig.update_layout(xaxis_title="Date", yaxis_title="Balance ($)")
    st.plotly_chart(fig, use_container_width=True)
    
    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Transactions by Category")
        categories = pd.DataFrame({
            "Category": ["Operations", "Marketing", "Salary", "Infrastructure"],
            "Amount": [45000, 23000, 67000, 12000]
        })
        st.bar_chart(categories.set_index("Category"))
    
    with col2:
        st.subheader("Risk Distribution")
        risk_data = pd.DataFrame({
            "Risk Level": ["Low", "Medium", "High", "Critical"],
            "Count": [85, 10, 4, 1]
        })
        fig = px.pie(risk_data, values="Count", names="Risk Level")
        st.plotly_chart(fig)

with tab2:
    st.subheader("Active Alerts")
    
    alerts = [
        {"type": "HIGH_AMOUNT", "severity": "HIGH", "message": "Transaction $75,000 exceeds threshold", "time": "2 min ago"},
        {"type": "BLOCKED_COUNTERPARTY", "severity": "CRITICAL", "message": "Blocked vendor detected", "time": "5 min ago"},
        {"type": "LOW_BALANCE", "severity": "MEDIUM", "message": "Balance below safety margin", "time": "10 min ago"},
    ]
    
    for alert in alerts:
        if alert["severity"] == "CRITICAL":
            st.error(f"🚨 **{alert['type']}**: {alert['message']} ({alert['time']})")
        elif alert["severity"] == "HIGH":
            st.warning(f"⚠️ **{alert['type']}**: {alert['message']} ({alert['time']})")
        else:
            st.info(f"ℹ️ **{alert['type']}**: {alert['message']} ({alert['time']})")

with tab3:
    st.subheader("Recommendations")
    
    recs = [
        {"action": "Block Vendor VENDOR_BLOCKED_1", "reason": "KYC verification failed", "risk": 0.95},
        {"action": "Review TX0045", "reason": "Unusual amount pattern", "risk": 0.72},
        {"action": "Increase credit line for V002", "reason": "Consistent payment history", "risk": 0.15},
    ]
    
    for rec in recs:
        with st.container():
            st.markdown(f"""
            **Action:** {rec['action']}  
            **Reason:** {rec['reason']}  
            **Risk Score:** {rec['risk']}
            """)
            col1, col2 = st.columns(2)
            with col1:
                if st.button(f"✅ Execute", key=f"exec_{rec['action']}"):
                    st.success("Action executed!")
            with col2:
                if st.button(f"❌ Dismiss", key=f"dismiss_{rec['action']}"):
                    st.info("Recommendation dismissed")
            st.divider()

with tab4:
    st.subheader("Audit Trail")
    
    audit_data = pd.DataFrame({
        "Timestamp": ["2024-01-15 10:30", "2024-01-15 10:25", "2024-01-15 10:20"],
        "Action": ["Blocked TX0042", "Reviewed TX0041", "Approved TX0040"],
        "Status": ["Executed", "Pending", "Executed"],
        "User": ["System", "Admin", "System"]
    })
    
    st.dataframe(audit_data, use_container_width=True)
