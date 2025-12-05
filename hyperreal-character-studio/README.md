# HyperReal Character Studio

A high-fidelity concept art generator powered by Google Imagen 3 and Gemini 1.5 Flash.

## 🚀 Deploy to Vercel

1.  **Download this project** to your local machine.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Push to GitHub** (or GitLab/Bitbucket).
4.  **Import in Vercel**:
    *   Go to [Vercel Dashboard](https://vercel.com/new).
    *   Select your repository.
    *   **Important**: In "Environment Variables", add:
        *   `API_KEY`: Your Google Gemini API Key.
5.  **Deploy**!

## 🌐 Custom Domain Setup (Recommended)

To give your studio a professional edge:

1.  Go to your Vercel Project **Settings** > **Domains**.
2.  Add your domain (e.g., `studio.yourdomain.com`).
3.  Vercel will provide DNS records (A record or CNAME) to add to your domain registrar.
4.  **Why?** Custom domains often have better edge caching performance and look more trustworthy for client presentations.

## 🛠️ Local Development

```bash
npm run dev
```
