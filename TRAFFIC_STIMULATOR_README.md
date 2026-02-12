# Traffic Stimulator for DemoKart

The Traffic Stimulator is a testing tool for the DemoKart e-commerce platform that allows you to simulate website traffic for analytics testing and performance evaluation. It also includes attack simulation capabilities for testing intrusion detection systems.

## Access

- **URL**: `http://localhost:3000/stimulator.html`
- **Username**: `stimulator`
- **Password**: `stimulate2024`

## Features

### **Traffic Testing Mode**
- **Page Visits**: Simulate homepage visits with configurable parameters
- **User Actions**: Generate realistic user interactions (viewing products, categories, cart operations)
- **Combined Traffic**: Run both simultaneously for comprehensive testing

### **Attack Simulation Mode** ⚠️
**WARNING: Attack simulation is for testing intrusion detection systems in controlled environments only. Do not use against production systems.**

Available attack types:
- **DoS Attack**: Floods server with rapid requests to overwhelm resources
- **DDoS Attack**: Distributed DoS with multiple concurrent connections
- **Brute Force**: Attempts various username/password combinations
- **SQL Injection**: Tests for SQL injection vulnerabilities with malicious payloads
- **XSS Attack**: Tests for cross-site scripting vulnerabilities
- **Port Scanning**: Simulates network scanning for open ports and services

### **Real-time Controls**
- Adjustable visit/action counts (1-100 visits, 1-50 actions)
- Configurable delays (100ms - 5s for visits, 500ms - 10s for actions)
- Concurrent users (1-10) for load testing
- Random variation (0-100%) for realistic traffic patterns

### **Live Monitoring Dashboard**
- Real-time statistics: visits generated, actions performed, success rate
- Progress bar for ongoing simulations
- Activity log with timestamps
- Current status updates

### **Analytics Integration**
- All simulated traffic integrates with existing analytics system
- Generates real page views, user sessions, and activity logs
- Appears in admin dashboard as legitimate traffic
- Perfect for testing analytics accuracy and dashboard functionality

## Usage

### Traffic Testing
1. Navigate to stimulator page and log in
2. Ensure "Traffic Testing" mode is selected
3. Configure traffic parameters using sliders and inputs
4. Choose traffic type (visits, actions, or combined)
5. Click start button to begin simulation
6. Monitor progress in real-time
7. Use stop button to halt simulations

### Attack Simulation
1. Switch to "Attack Simulation" mode using the toggle
2. **READ THE WARNING** - ensure you're in a controlled testing environment
3. Select one or more attack types by clicking the attack cards
4. Click "Start Attack Simulation" to begin
5. Monitor attack progress and system responses
6. All attacks are logged for IDS analysis

## Technical Details

- **Backend**: Separate authentication and logging for attack simulations
- **Frontend**: Dual-mode interface with attack type selection
- **Security**: Session-based authentication with proper access controls
- **Integration**: Seamlessly works with existing analytics and logging systems
- **Logging**: Attack attempts logged to dedicated attack_logs table for IDS testing

## Security Notice

The attack simulation features are designed exclusively for:
- Testing intrusion detection systems
- Security research in controlled environments
- Educational purposes

**Do not use these features against:**
- Production systems
- Systems without explicit permission
- Any system that could cause harm or disruption

All attack simulations are logged and monitored. Misuse may have legal consequences.