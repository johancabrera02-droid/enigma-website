
# Enigma Collection RD — E-Commerce Website

A responsive e-commerce website developed for Enigma Collection RD, a retail business specializing in fashion, fragrances, and accessories.

The project features a dynamic product catalog connected to an inventory management system through a Python REST API.

**Live Website:** https://enigmacollectionrd.com/

## Features

- Responsive design for desktop and mobile devices
- Dynamic product catalog synchronized with inventory data
- Product search and category filtering
- Interactive product previews and image viewer
- WhatsApp shopping integration
- Automatic product ordering by registration ID
- New arrival badges displayed during the first 21 days
- Product availability filtering
- Product photographs hosted on cloud storage

## Tech Stack

**Frontend**
- HTML5
- CSS3
- Vanilla JavaScript

**Backend Integration**
- Python REST API
- Google Sheets as the inventory data source

**Hosting**
- GitHub Pages
- Custom domain

## System Architecture

```text
Inventory Management Application
              |
              v
       Google Apps Script
              |
              v
          Google Sheets
              |
              v
       Python REST API
              |
              v
       Enigma Website
              |
              v
           Customers
```

The website retrieves product information through a public API.

Inventory management and private credentials are handled separately from the frontend.

## Project Structure

```text
enigma-website/
├── index.html
├── style.css
├── app.js
├── logo-enigma.png
├── hero-enigma.png
├── robots.txt
├── sitemap.xml
├── CNAME
├── .gitignore
└── README.md
```

## Running Locally

Clone the repository:

```bash
git clone https://github.com/johancabrera02-droid/enigma-website.git
cd enigma-website
```

Start a local server:

```bash
python3 -m http.server 8000
```

Open http://localhost:8000 in your browser.

The product catalog requires access to the public backend API.

## Screenshots

Desktop and mobile screenshots will be added here.

## Future Improvements

- Performance optimization
- Accessibility improvements
- Additional SEO enhancements
- Further mobile experience refinements

## Project Overview

This project demonstrates responsive frontend development, REST API integration, dynamic content rendering, inventory-driven catalog management, and real-world deployment.

Developed as a functional e-commerce solution for Enigma Collection RD.
