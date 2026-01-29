# BLAZIX S4 Prediction API

A GitHub Pages hosted prediction API with custom calculation logic.

## 🌐 Live Demo
https://your-username.github.io/blazix-api-gh-pages/

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/current` | GET | Get current prediction |
| `/api/stats` | GET | Get statistics (win/loss/accuracy) |
| `/api/history` | GET | Get prediction history |
| `/api/previous` | GET | Get previous results |
| `/api/status` | GET | Get system status |
| `/api/all` | GET | Get all data in one response |
| `/api/calculate/{numbers}` | GET | Manual calculation |

## 🔧 Calculation Logic

**Formula:** `(first + fifth) - last = result`

1. Take last 10 numbers (most recent first)
2. Add 1st and 5th numbers
3. Subtract 10th number
4. If result is 2 digits, reduce (e.g., 14 → 1+4=5)
5. If negative, make positive
6. **BIG** if result ≥5, **SMALL** if <5

**Example:**
