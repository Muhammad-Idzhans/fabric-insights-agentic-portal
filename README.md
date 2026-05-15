# 🤖 Power BI Insights Agent for Microsoft Foundry
An enterprise-ready web application built with Next.js that seamlessly embeds Power BI reports and integrates a smart Generative AI chatbot powered by the Microsoft Azure AI ecosystem. This project allows users to securely view their internal data dashboards and ask contextual questions to an AI agent hosted in Azure AI Foundry.

## 📖 Overview
This project provides a complete end-to-end web application that bridges the gap between data visualization and conversational AI. Users authenticate securely via Microsoft Entra ID to access their personalized Power BI "Insights Dashboard". While analyzing their reports, users can interact with a grounded AI agent in a responsive chat interface. The AI agent, orchestrated by Azure AI Foundry, processes user queries and provides accurate, data-driven responses.

The entire solution is designed for seamless deployment on Azure Web Apps, utilizing modern web frameworks and enterprise-grade security practices.

## ✨ Key Features
- **Embedded Power BI:** View interactive reports directly within the application using `powerbi-client-react`, complete with dynamic mobile-layout switching for smaller screens.
- **Intelligent Agent:** Powered by Azure AI Foundry to orchestrate natural language understanding and response generation directly alongside your data.
- **Enterprise Security:** Secured by Microsoft Entra ID (via NextAuth) ensuring only authorized users can access reports and the AI agent.
- **Modern Web UI:** Built on the Next.js framework with Ant Design and Bootstrap for a highly responsive, server-side rendered, and optimized user experience.
- **Responsive Design:** A fully responsive chatbot that intelligently scales into a full-screen view on mobile devices while preserving the background dashboard.

## 🏗️ Architecture
![Architecture Diagram](media/architecture.png)

## 💻 Tech Stack
- **Frontend & API**: [Next.js](https://nextjs.org/) (React Framework)
- **UI Components**: Ant Design (antd) & Bootstrap
- **Authentication**: NextAuth.js (Microsoft Entra ID)
- **Data Visualization**: Power BI Client React
- **AI Orchestration**: Microsoft Foundry / Azure AI Projects SDK
- **Deployment**: Azure App Service (Web App)

## 📋 Prerequisites
Before setting up the project locally, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) (For local Azure resource management)
- An active Azure Subscription with an AI Foundry project and an AI Agent provisioned.
- A Power BI Pro/Premium license with an accessible Workspace and Report.
- An App Registration in Microsoft Entra ID for authentication.

## ⚙️ Environment Variables
Create a `.env.local` file in the `nextjs-powerbi-ui` directory and configure the following variables.

```env
# Azure AI Foundry Settings
FOUNDRY_PROJECT_ENDPOINT="https://<your-resource-name>.services.ai.azure.com/api/projects/<your-project-name>"
AZURE_OPENAI_API_KEY="<your-azure-openai-api-key>"
AZURE_OPENAI_DEPLOYMENT_NAME="<your-deployment-name-e.g-gpt-4o>"
AZURE_OPENAI_AGENT_ID="<your-agent-id>"

# Entra ID Authentication
AUTH_MICROSOFT_ENTRA_ID_ID="<your-entra-id-client-id>"
AUTH_MICROSOFT_ENTRA_ID_SECRET="<your-entra-id-client-secret>"
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID="<your-entra-id-tenant-id>"
AUTH_MICROSOFT_ENTRA_ID_ISSUER="https://login.microsoftonline.com/<your-entra-id-tenant-id>/v2.0"
AUTH_SECRET="<your-generated-nextauth-secret>"
AUTH_URL="http://localhost:3000"

# Power BI Related
NEXT_PUBLIC_POWERBI_REPORT_ID="<your-powerbi-report-id>"
NEXT_PUBLIC_POWERBI_GROUP_ID="<your-powerbi-workspace-group-id>"
```

## 🚀 Local Setup
**1. Clone the repository:**
```cmd
git clone <your-repository-url>
```
```cmd
cd DEMO_E01_CASHFLOW_PROJECT/nextjs-powerbi-ui
```

**2. Install dependencies**
```cmd
npm install
```

**3. Authenticate with Azure CLI:**
To test Azure AI connections locally, log in to the Azure CLI using an account that has access to your resources.
```cmd
az login
```

**4. Run the development server:**
```cmd
npm run dev
```

**5. Access the application:**
Open [http://localhost:3000](http://localhost:3000) in your web browser.

## ☁️ Deployment to Azure Web App

Deploying this application to Azure Web App requires a specific set of configurations to handle the Next.js standalone build properly.

**1. Create the Azure Web App:**
In the Azure Portal, create a new Web App with the following settings:
- **Publish:** Code
- **Runtime stack:** Node 22 LTS
- **Operating System:** Linux
- **Region:** Choose your preferred region
- **Pricing Plan:** Select your appropriate Linux plan

**2. Configure Deployment:**
- During creation or via the **Deployment Center** tab, enable **Continuous Deployment**.
- Select your GitHub account and choose the repository and branch.
- Once finished, Azure will automatically generate a `.github/workflows` folder with a `.yml` file in your repository.

**3. Edit the GitHub Actions Workflow:**
You need to modify the generated `.yml` file to properly handle the Next.js standalone build structure. Ensure your build step includes the logic to flatten the standalone directory and copy the necessary static files (e.g., `public`/`.next/static`).

**4. Configure Environment Variables:**
In the Azure Portal, navigate to your Web App's **Settings** -> **Environment variables**. Add all the keys from your `.env.local` file. 
- *Note: Ensure you enter the variable values exactly as they are, without surrounding quotes (`""`).*

**5. Update the Startup Command:**
To tell Azure how to start the standalone Next.js server:
- Navigate to **Settings** -> **Configuration** -> **Stack Settings** tab.
- Locate the **Startup Command** field.
- Enter exactly: `node server.js`
- Save the changes.

**6. Configure Entra ID Authentication Redirects:**
Ensure your Microsoft Entra ID App Registration is updated with the correct Web App URL:
- Go to your App Registration -> **Authentication**.
- Add the redirect URI: `https://<your-webapp-name>.azurewebsites.net/api/auth/callback/microsoft-entra-id`

**7. Monitor and Access:**
- Check the **Log stream** under the **Monitoring** section to ensure the application starts correctly.
- Once the logs confirm a successful startup, navigate to the **Overview** page and click the **Default domain** link to open your deployed application.

## 🖱️ Usage Guide

**1. Secure Login**
Open your browser and navigate to your deployed Azure Web App URL. You will be greeted by the login screen. Click the "Sign in with Microsoft Entra ID" button to authenticate securely.

**2. View Power BI Dashboard**
Once logged in, the main dashboard will embed your configured Power BI report. The report automatically scales and adjusts layout based on whether you are using a desktop or mobile device.

**3. Interact with the Insights Agent**
Click the floating chat bubble icon in the bottom right corner to open the Insights Agent.
- **Desktop Mode:** The chat opens as a side pane over the report. You can expand it using the maximize icon in the header.
- **Mobile Mode:** The chat automatically opens in a full-screen view for the best mobile experience.

**4. Ask Questions**
Type your questions into the chat input. The chatbot will display dynamic "thinking" animations while querying the Azure AI Foundry agent, before returning detailed, markdown-formatted insights.

**5. Clear Chat**
Click the trash can icon in the chat header to reset your conversation history with the agent.

---

<div align="center">
  <em>Developed by Muhammad Idzhans Khairi</em>
</div>
