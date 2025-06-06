'use client';

import { Button } from "@/components/ui/button";
import googleLogo from "@/public/google.svg";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Fragment, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { cn, getCodeHostIcon } from "@/lib/utils";
import { MagicLinkForm } from "./magicLinkForm";
import { CredentialsForm } from "./credentialsForm";
import { SourcebotLogo } from "@/app/components/sourcebotLogo";
import { TextSeparator } from "@/app/components/textSeparator";
import useCaptureEvent from "@/hooks/useCaptureEvent";
import DemoCard from "@/app/[domain]/onboard/components/demoCard";
import Link from "next/link";
import { env } from "@/env.mjs";

const TERMS_OF_SERVICE_URL = "https://sourcebot.dev/terms";
const PRIVACY_POLICY_URL = "https://sourcebot.dev/privacy";

interface LoginFormProps {
    callbackUrl?: string;
    error?: string;
    enabledMethods: {
        github: boolean;
        google: boolean;
        magicLink: boolean;
        credentials: boolean;
    }
}

export const LoginForm = ({ callbackUrl, error, enabledMethods }: LoginFormProps) => {
    const captureEvent = useCaptureEvent();
    const onSignInWithOauth = useCallback((provider: string) => {
        signIn(provider, { redirectTo: callbackUrl ?? "/" });
    }, [callbackUrl]);

    const errorMessage = useMemo(() => {
        if (!error) {
            return "";
        }
        switch (error) {
            case "CredentialsSignin":
                return "Invalid email or password. Please try again.";
            case "OAuthAccountNotLinked":
                return "This email is already associated with a different sign-in method.";
            default:
                return "An error occurred during authentication. Please try again.";
        }
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="mb-6 flex flex-col items-center">
                <SourcebotLogo
                    className="h-12 sm:h-16"
                />
                <h2 className="text-lg font-bold text-center">Sign in to your account</h2>
            </div>
            {env.NEXT_PUBLIC_SOURCEBOT_CLOUD_ENVIRONMENT !== undefined && (
                <div className="w-full sm:w-[500px] max-w-[500px]">
                    <DemoCard />
                </div>
            )}
            <Card className="flex flex-col items-center border p-6 sm:p-12 rounded-lg gap-4 sm:gap-6 w-full sm:w-[500px] max-w-[500px] bg-background">
                {error && (
                    <div className="text-sm text-destructive text-center text-wrap border p-2 rounded-md border-destructive">
                        {errorMessage}
                    </div>
                )}
                <DividerSet
                    elements={[
                        ...(enabledMethods.github || enabledMethods.google ? [
                            <>
                                {enabledMethods.github && (
                                    <ProviderButton
                                        key="github"
                                        name="GitHub"
                                        logo={getCodeHostIcon("github")!}
                                        onClick={() => {
                                            captureEvent("wa_login_with_github", {});
                                            onSignInWithOauth("github")
                                        }}
                                    />
                                )}
                                {enabledMethods.google && (
                                    <ProviderButton
                                        key="google"
                                        name="Google"
                                        logo={{ src: googleLogo }}
                                        onClick={() => {
                                            captureEvent("wa_login_with_google", {});
                                            onSignInWithOauth("google")
                                        }}
                                    />
                                )}
                            </>
                        ] : []),
                        ...(enabledMethods.magicLink ? [
                            <MagicLinkForm key="magic-link" callbackUrl={callbackUrl} />
                        ] : []),
                        ...(enabledMethods.credentials ? [
                            <CredentialsForm key="credentials" callbackUrl={callbackUrl} />
                        ] : [])
                    ]}
                />
            </Card>
            {env.NEXT_PUBLIC_SOURCEBOT_CLOUD_ENVIRONMENT !== undefined && (
                <p className="text-xs text-muted-foreground mt-8">By signing in, you agree to the <Link className="underline" href={TERMS_OF_SERVICE_URL} target="_blank">Terms of Service</Link> and <Link className="underline" href={PRIVACY_POLICY_URL} target="_blank">Privacy Policy</Link>.</p>
            )}
        </div>
    )
}

const ProviderButton = ({
    name,
    logo,
    onClick,
    className,
}: {
    name: string;
    logo: { src: string, className?: string };
    onClick: () => void;
    className?: string;
}) => {
    return (
        <Button
            onClick={onClick}
            className={cn("w-full", className)}
            variant="outline"
        >
            {logo && <Image src={logo.src} alt={name} className={cn("w-5 h-5 mr-2", logo.className)} />}
            Sign in with {name}
        </Button>
    )
}

const DividerSet = ({ elements }: { elements: React.ReactNode[] }) => {
    return elements.map((child, index) => {
        return (
            <Fragment key={index}>
                {child}
                {index < elements.length - 1 && <TextSeparator key={`divider-${index}`} />}
            </Fragment>
        )
    })
}
