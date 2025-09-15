# Vercel Deployment Guide for Secure Scholar Seal

This guide provides step-by-step instructions for deploying the Secure Scholar Seal application to Vercel.

## Prerequisites

- GitHub account with the Secure Scholar Seal repository
- Vercel account (free tier available)
- Environment variables ready

## Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. Ensure all code is committed and pushed to GitHub
2. Verify that the `package.json` has the correct build scripts
3. Check that all dependencies are properly listed

### Step 2: Connect to Vercel

1. **Visit Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Create New Project**
   - Click the "New Project" button
   - Select "Import Git Repository"
   - Choose `DjangoWizard/secure-scholar-seal` from the list
   - Click "Import"

### Step 3: Configure Project Settings

1. **Project Name**
   - Project Name: `secure-scholar-seal`
   - Framework Preset: `Vite`
   - Root Directory: `./` (default)

2. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Step 4: Environment Variables

In the Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```env
# Chain Configuration
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Wallet Connect Configuration
VITE_WALLET_CONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID

# Optional: Alternative RPC URLs
VITE_ALT_RPC_URL=https://1rpc.io/sepolia
```

**Important**: Set these for all environments (Production, Preview, Development)

### Step 5: Deploy

1. **Initial Deployment**
   - Click "Deploy" button
   - Wait for the build process to complete (usually 2-3 minutes)
   - Monitor the build logs for any errors

2. **Verify Deployment**
   - Once deployed, click on the generated URL
   - Test the application functionality
   - Verify wallet connection works
   - Check that the UI loads correctly

### Step 6: Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to **Settings** → **Domains**
   - Click "Add Domain"
   - Enter your custom domain
   - Follow DNS configuration instructions

2. **SSL Certificate**
   - Vercel automatically provides SSL certificates
   - HTTPS will be enabled automatically

## Post-Deployment Configuration

### 1. Update Smart Contract Addresses

If you deploy new contracts, update the contract addresses in your frontend:

```typescript
// src/config/contracts.ts
export const CONTRACT_ADDRESSES = {
  SECURE_SCHOLAR_SEAL: "0x...", // Your deployed contract address
};
```

### 2. Verify Environment Variables

Ensure all environment variables are properly set in Vercel:

```bash
# Check in Vercel dashboard
Settings → Environment Variables
```

### 3. Test Full Functionality

- [ ] Wallet connection works
- [ ] Smart contract interactions function
- [ ] FHE operations work correctly
- [ ] UI is responsive on mobile
- [ ] All pages load without errors

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation passes locally

2. **Environment Variables Not Working**
   - Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
   - Check that variables are set for the correct environment
   - Redeploy after adding new variables

3. **Wallet Connection Issues**
   - Verify WalletConnect Project ID is correct
   - Check RPC URL is accessible
   - Ensure chain ID matches your configuration

4. **Smart Contract Errors**
   - Verify contract addresses are correct
   - Check that contracts are deployed on the correct network
   - Ensure user has sufficient gas tokens

### Performance Optimization

1. **Enable Vercel Analytics**
   - Go to **Analytics** tab in Vercel dashboard
   - Enable Web Analytics for performance monitoring

2. **Optimize Bundle Size**
   - Use dynamic imports for large components
   - Implement code splitting
   - Optimize images and assets

## Monitoring and Maintenance

### 1. Set Up Monitoring

- Enable Vercel Analytics
- Set up error tracking (Sentry integration)
- Monitor build performance

### 2. Regular Updates

- Keep dependencies updated
- Monitor for security vulnerabilities
- Update smart contracts as needed

### 3. Backup Strategy

- Code is automatically backed up in GitHub
- Environment variables should be documented
- Keep local copies of important configurations

## Deployment URLs

After successful deployment, your application will be available at:

- **Production**: `https://secure-scholar-seal.vercel.app`
- **Preview**: `https://secure-scholar-seal-git-[branch].vercel.app`
- **Development**: `https://secure-scholar-seal-git-main-djangowizard.vercel.app`

## Support

For deployment issues:

1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review build logs in Vercel dashboard
3. Test locally with `npm run build` and `npm run preview`
4. Contact Vercel support if needed

---

**Deployment completed successfully!** 🎉

Your Secure Scholar Seal application is now live and ready for users to experience FHE-powered academic credential verification.
