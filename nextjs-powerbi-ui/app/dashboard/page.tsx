"use client";

import dynamic from "next/dynamic";
import type { models as modelsType } from "powerbi-client";

// powerbi-client-react references `self` which doesn't exist on the server
const PowerBIEmbed = dynamic(
    () => import("powerbi-client-react").then((mod) => mod.PowerBIEmbed),
    { ssr: false }
);
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { Layout, Button, Typography, Avatar, Dropdown, theme, Spin } from "antd";
import {
    UserOutlined,
    LogoutOutlined,
    BarChartOutlined,
    SendOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { FloatButton } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const { Header, Content } = Layout;
const { Text } = Typography;

export default function DashboardPage() {
    // Chat box visibility
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Chat state
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [thinkingText, setThinkingText] = useState("...");
    const [conversationId, setConversationId] = useState<string | null>(null);

    // Refs
    const messageEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Send message to the agent
    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setThinkingText("...");

        // Fire off the 'think' request concurrently
        fetch("/api/chat/think", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage.content }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.phrase) setThinkingText(data.phrase);
            })
            .catch(err => console.error("Think error:", err));

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage.content, conversationId }),
            });

            const data = await response.json();

            if (data.reply) {
                if (data.conversationId) {
                    setConversationId(data.conversationId);
                }
                setIsLoading(false);
                setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
            } else {
                console.error("Agent returned an error:", data.error);
                setIsLoading(false);
                setMessages((prev) => [...prev, {
                    role: "assistant",
                    content: data.error || "Sorry, something went wrong. Please try again."
                }]);
            }
        } catch (error) {
            console.error("Communication failed:", error);
            setIsLoading(false);
            setMessages((prev) => [...prev, {
                role: "assistant",
                content: "Unable to reach the server. Please check your connection and try again."
            }]);
        }
    };

    // Clear chat
    const clearChat = () => {
        setMessages([]);
        setConversationId(null);
        setThinkingText("...");
    };

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const { data: session, status } = useSession();

    // Show spinner while session loads
    if (status === "loading") {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "100vh" }}
            >
                <Spin size="large" />
            </div>
        );
    }

    // Get the REAL user name and email from Entra ID session
    const userName = session?.user?.name || "User";
    const userEmail = session?.user?.email || "";

    const profileMenuItems: MenuProps["items"] = [
        {
            key: "user-info",
            label: (
                <div className="py-1">
                    <Text strong>{userName}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {userEmail}
                    </Text>
                </div>
            ),
            disabled: true,
        },
        { type: "divider" },
        {
            key: "sign-out",
            icon: <LogoutOutlined />,
            label: "Sign Out",
            danger: true,
            onClick: () => signOut({ callbackUrl: "/" }),
        },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* Header */}
            <Header className="d-flex justify-content-between align-items-center px-4 border-bottom" style={{ background: colorBgContainer }} >
                <div className="d-flex align-items-center gap-2">
                    <BarChartOutlined style={{ fontSize: 20, color: "#0078d4" }} />
                    <Text className="fw-bold" style={{ fontSize: 16 }}>
                        Insights Dashboard
                    </Text>
                </div>

                <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight">
                    <div className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                        <div className="d-none d-md-inline text-end">
                            <Text style={{ display: 'block', lineHeight: 1.3 }}>{userName}</Text>
                            <Text type="secondary" style={{ fontSize: 11, display: 'block', lineHeight: 1.3 }}>{userEmail}</Text>
                        </div>
                        <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#0078d4" }} />
                    </div>
                </Dropdown>
            </Header>

            {/* Power BI Embed Area */}
            <Content className="p-3">
                {/* Placeholder — will be replaced with <PowerBIEmbed /> later */}
                {/* <div
                    className="powerbi-container d-flex justify-content-center align-items-center rounded"
                    style={{ backgroundColor: "#fff", border: "2px dashed #d9d9d9" }}
                >
                    <div className="text-center">
                        <BarChartOutlined style={{ fontSize: 64, color: "#bfbfbf" }} />

                        <br />

                        <Text type="secondary" style={{ fontSize: 16 }}>
                            Power BI Report will be embedded here
                        </Text>
                    </div>
                </div> */}
                {/* Power BI Embedded Report */}
                <div className="">
                    {session?.accessToken ? (
                        <PowerBIEmbed
                            embedConfig={{
                                type: "report",
                                id: process.env.NEXT_PUBLIC_POWERBI_REPORT_ID!,
                                embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${process.env.NEXT_PUBLIC_POWERBI_REPORT_ID}&groupId=${process.env.NEXT_PUBLIC_POWERBI_GROUP_ID}`,
                                accessToken: session.accessToken,
                                tokenType: 0,  // 0 = TokenType.Aad
                                settings: {
                                    panes: {
                                        filters: { expanded: false, visible: false },
                                        pageNavigation: { visible: false },
                                    },
                                    background: 1,  // 1 = BackgroundType.Transparent
                                },
                            }}
                            cssClassName="powerbi-container"
                        />
                    ) : (
                        <div
                            className="powerbi-container d-flex justify-content-center align-items-center rounded"
                            style={{ backgroundColor: "#fff", border: "2px dashed #d9d9d9" }}
                        >
                            <Spin size="large" />
                        </div>
                    )}
                </div>

                {/* Chatbot Chatting Area - Always rendered, animated via CSS */}
                <div>
                    <div className={`position-fixed shadow rounded bottom-0 end-0 chatbot-chat-box ${isChatOpen ? 'chat-open' : 'chat-closed'}`}>
                        {/* Header */}
                        <div className="border-bottom p-2 bg-primary rounded-top d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-white">Insights Agent</span>
                            {messages.length > 0 && (
                                <button
                                    onClick={clearChat}
                                    disabled={isLoading}
                                    className="btn btn-sm text-white border-0 p-0 px-1"
                                    title="Clear Chat"
                                    style={{ fontSize: '0.75rem', opacity: 0.8 }}
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            )}
                        </div>

                        {/* Messages */}
                        <div
                            className="flex-grow-1 overflow-auto p-2 scrollbar-hide"
                            ref={chatContainerRef}
                            style={{ fontSize: '0.85rem' }}
                        >
                            {messages.length === 0 && !isLoading ? (
                                /* Welcome message - key forces re-mount after clear for animation */
                                <div key={`welcome-${conversationId || 'new'}`} className="h-100 d-flex flex-column align-items-center justify-content-center text-center text-secondary welcome-fade-in" style={{ fontSize: '0.8rem' }}>
                                    <i className="bi bi-stars fs-1 mb-2" style={{ color: '#d1d5db' }}></i>
                                    <span>Ask me anything about your cashflow data</span>
                                </div>
                            ) : (
                                /* Chat messages */
                                <div className="d-flex flex-column gap-3">
                                    {messages.map((msg, index) =>
                                        msg.role === "assistant" ? (
                                            /* Assistant message */
                                            <div key={index} className="d-flex align-items-start gap-2 animate-fade-in-up">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '28px', height: '28px', backgroundColor: '#f3f4f6', fontSize: '0.7rem' }}>
                                                    <i className="bi bi-stars"></i>
                                                </div>
                                                <div className="chat-bubble p-2 text-dark text-break" style={{ backgroundColor: '#f3f4f6', borderRadius: '4px 14px 14px 14px', maxWidth: '85%' }}>
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            a: ({ node, href, ...props }) => <a
                                                                {...props}
                                                                href={href}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            />,
                                                            ul: ({ node, ...props }) => <ul className="ps-3 mb-1" {...props} />,
                                                            ol: ({ node, ...props }) => <ol className="ps-3 mb-1" {...props} />,
                                                            li: ({ node, ...props }) => <li className="mb-0" {...props} />
                                                        }}
                                                    >
                                                        {msg.content.replace(/【.*?】/g, '')}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        ) : (
                                            /* User message */
                                            <div key={index} className="d-flex justify-content-end animate-fade-in-up">
                                                <div className="chat-bubble p-2 text-white text-break" style={{ backgroundColor: '#3b82f6', borderRadius: '14px 14px 4px 14px', maxWidth: '85%' }}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        )
                                    )}

                                    {/* Typing Indicator */}
                                    {isLoading && (
                                        <div className="d-flex align-items-start gap-2">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '28px', height: '28px', backgroundColor: '#f3f4f6', fontSize: '0.7rem' }}>
                                                <i className="bi bi-stars"></i>
                                            </div>
                                            <div className="p-2 text-dark d-flex align-items-center gap-1" style={{ backgroundColor: '#f3f4f6', borderRadius: '4px 14px 14px 14px', minHeight: '36px' }}>
                                                {thinkingText === "..." ? (
                                                    <>
                                                        <div className="typing-dot"></div>
                                                        <div className="typing-dot"></div>
                                                        <div className="typing-dot"></div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm text-secondary" role="status" aria-hidden="true" style={{ width: '12px', height: '12px' }}></span>
                                                        <span className="text-secondary fst-italic" style={{ fontSize: '0.8rem' }}>{thinkingText}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div ref={messageEndRef}></div>
                        </div>

                        {/* Input */}
                        <div className="border-top p-2">
                            <div className="d-flex align-items-center">
                                <input
                                    type="text"
                                    className="form-control border-0 shadow-none"
                                    placeholder="Type a message..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                    disabled={isLoading}
                                    style={{ fontSize: '0.85rem' }}
                                />
                                <button
                                    className="border-0 bg-white text-secondary fs-5"
                                    onClick={sendMessage}
                                    disabled={isLoading || !input.trim()}
                                >
                                    {isLoading ? (
                                        <span className="spinner-border spinner-border-sm text-secondary" role="status" aria-hidden="true" style={{ width: '14px', height: '14px' }}></span>
                                    ) : (
                                        <SendOutlined />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Animated Float Button - single button with icon crossfade */}
                    <FloatButton
                        className="fs-6"
                        type="primary"
                        style={{ width: 50, height: 50 }}
                        icon={
                            <span style={{ position: 'relative', display: 'inline-flex', width: '1em', height: '1em' }}>
                                <span className={`chat-fab-icon ${isChatOpen ? 'icon-spin-out' : 'icon-spin-in'}`} style={{ position: 'absolute', inset: 0 }}>
                                    <i className="bi bi-chat-left-text-fill"></i>
                                </span>
                                <span className={`chat-fab-icon ${isChatOpen ? 'icon-spin-in' : 'icon-spin-out'}`} style={{ position: 'absolute', inset: 0 }}>
                                    <i className="bi bi-x-lg"></i>
                                </span>
                            </span>
                        }
                        onClick={() => setIsChatOpen(!isChatOpen)}
                    />
                </div>


            </Content>

        </Layout>
    );
}