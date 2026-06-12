<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/tumbuhindigi-sys/momiji-home-frontend">
    <img src="public/favicon.ico" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Momiji Home Dashboard</h3>

  <p align="center">
    A premium B2B and e-commerce platform for Momiji Home, featuring advanced inventory management and a refined shopping experience.
    <br />
    <a href="https://github.com/tumbuhindigi-sys/momiji-home-frontend"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/tumbuhindigi-sys/momiji-home-frontend">View Demo</a>
    ·
    <a href="https://github.com/tumbuhindigi-sys/momiji-home-frontend/issues">Report Bug</a>
    ·
    <a href="https://github.com/tumbuhindigi-sys/momiji-home-frontend/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#key-features">Key Features</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

Momiji Home Dashboard is a comprehensive solution designed to bridge the gap between B2B inventory management and a high-end retail experience. It allows for seamless management of "Ship-Ready" and "Pre-Order" product categories with automated Shopify synchronization.

### Built With

* [![Next][Next.js]][Next-url]
* [![React][React.js]][React-url]
* [![Tailwind][Tailwind.css]][Tailwind-url]
* [![Zustand][Zustand.js]][Zustand-url]
* [![TanStack Query][Query.js]][Query-url]
* [![Framer Motion][Motion.js]][Motion-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

* pnpm
  ```sh
  npm install -g pnpm
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/tumbuhindigi-sys/momiji-home-frontend.git
   ```
2. Install PNPM packages
   ```sh
   pnpm install
   ```
3. Create a `.env` file based on `.env.example`
   ```sh
   cp .env.example .env
   ```
4. Run the development server
   ```sh
   pnpm dev
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- PROJECT STRUCTURE -->
## Project Structure

* `app/(admin)` - Admin dashboard routes for inventory, pricing, and synchronization.
* `app/(public)` - Public-facing shop catalog, cart, and checkout flow.
* `components/features` - Complex domain-specific React components.
* `components/ui` - Shadcn base UI components.
* `components/global` - Reusable UI components used across the entire application.
* `components/layouts` & `components/providers` - Application wrappers and layout shells.
* `lib/` - Core utilities, Zustand state stores, services, and API configurations.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- KEY FEATURES -->
## Key Features

* **Strict Clean Code Architecture**: Engineered with a strict 6-block import hierarchy and 8-step internal component logic for ultra-maintainable code.
* **Advanced Catalog Management**: Specialized workflows for "Ship-Ready" and "Pre-Order" designs.
* **Admin Operations Dashboard**: Comprehensive tools for managing customer histories, order fulfillment steps, and pre-order settlements.
* **Seamless Checkout Flow**: Integrated guest-mode cart, shipping calculations, and address validation bridging to Shopify hosted checkout.
* **Shopify Synchronization**: Integrated sync status tracking for inventory, product dimensions, and pricing.
* **Modern UI/UX**: Built with Radix UI, Framer Motion, and a custom tailored design system.
* **Localization**: Multi-language support using `i18next`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] Wave 1: Cart Architecture Refactoring
- [x] Wave 2: Implement Checkout Flow & Shipping Methods
- [x] Wave 3: Admin Features (Order Mgmt, Customers, Preorders, CSV Dimensions)
- [x] Wave 4: Architecture & Clean Code Standardization (Strict 6-block hierarchy)
- [ ] Wave 5: Advanced Analytics & Sales Report integrations

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Tumbuhindigi Systems - [https://github.com/tumbuhindigi-sys](https://github.com/tumbuhindigi-sys)

Project Link: [https://github.com/tumbuhindigi-sys/momiji-home-frontend](https://github.com/tumbuhindigi-sys/momiji-home-frontend)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Tailwind.css]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Zustand.js]: https://img.shields.io/badge/Zustand-443322?style=for-the-badge&logo=react&logoColor=white
[Zustand-url]: https://zustand-demo.pmnd.rs/
[Query.js]: https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white
[Query-url]: https://tanstack.com/query/latest
[Motion.js]: https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white
[Motion-url]: https://www.framer.com/motion/
