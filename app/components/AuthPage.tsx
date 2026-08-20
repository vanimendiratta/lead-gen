"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export interface AuthUser {
  email: string;
  name: string;
  role: string;
}

interface AuthPageProps {
  onLogin: (user: AuthUser) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const DEMO_EMAIL = "adminsandeep@gamil.com";
  const DEMO_PASS = "sandeepadmin123";

  function handleAutofillAdmin() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASS);
    setName("Sandeep Admin");
    toast.info("Admin credentials loaded!");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const cleanEmail = email.trim().toLowerCase();

      if (mode === "login") {
        // Admin credentials check (accepting both gamil.com and gmail.com spelling)
        if (
          (cleanEmail === "adminsandeep@gamil.com" || cleanEmail === "adminsandeep@gmail.com") &&
          password === DEMO_PASS
        ) {
          const adminUser: AuthUser = {
            email: cleanEmail,
            name: "Sandeep (Admin)",
            role: "Administrator",
          };
          localStorage.setItem("lead_to_launch_user", JSON.stringify(adminUser));
          toast.success("Welcome back, Sandeep! Logged in as Admin.");
          onLogin(adminUser);
          return;
        }

        // Generic login fallback for test users
        if (password.length >= 6) {
          const user: AuthUser = {
            email: cleanEmail,
            name: cleanEmail.split("@")[0],
            role: "Member",
          };
          localStorage.setItem("lead_to_launch_user", JSON.stringify(user));
          toast.success(`Welcome back, ${user.name}!`);
          onLogin(user);
        } else {
          toast.error("Invalid credentials. Hint: adminsandeep@gamil.com / sandeepadmin123");
        }
      } else {
        // Sign up mode
        if (!name) {
          toast.error("Please enter your name for Sign Up");
          return;
        }
        const newUser: AuthUser = {
          email: cleanEmail,
          name: name.trim(),
          role: "Member",
        };
        localStorage.setItem("lead_to_launch_user", JSON.stringify(newUser));
        toast.success(`Account created! Welcome, ${newUser.name}.`);
        onLogin(newUser);
      }
    }, 600);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-digital-mesh p-4 relative overflow-hidden">
      {/* VEEV Ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header Logo Brand */}
        <div className="flex flex-col items-center justify-center text-center mb-6 space-y-2">
          {/* VEEV Inspired Logo Mark Icon */}
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-slate-900 p-0.5 shadow-xl shadow-cyan-950/50">
            <div className="h-full w-full bg-slate-950/80 backdrop-blur-md rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute -top-3 -right-3 h-8 w-8 bg-cyan-400/30 rounded-full blur-md" />
              <div className="flex items-baseline font-display font-black text-xl tracking-tighter text-white">
                <span className="text-cyan-400">v</span>
                <span className="text-sky-300">e</span>
                <span className="text-blue-500">e</span>
                <span className="text-xs text-cyan-400 font-bold ml-0.5">v</span>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight gradient-text-veev">
            Lead → Launch Studio
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Powered by VEEV AI Intelligence Pipeline
          </p>
        </div>

        {/* Main Auth Card */}
        <Card className="glass-card border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Top Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-secondary/50 border-b border-border/40">
            <button
              onClick={() => setMode("login")}
              className={`py-2.5 rounded-2xl text-xs font-semibold font-mono transition-all flex items-center justify-center gap-2 ${
                mode === "login"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn className="h-3.5 w-3.5" /> Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`py-2.5 rounded-2xl text-xs font-semibold font-mono transition-all flex items-center justify-center gap-2 ${
                mode === "signup"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" /> Create Account
            </button>
          </div>

          <CardHeader className="pb-4 pt-6 text-center">
            <CardTitle className="text-lg font-bold">
              {mode === "login" ? "Welcome Back" : "Start Your Agency Journey"}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {mode === "login"
                ? "Enter your credentials to access Mission Control"
                : "Register a new workspace account"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-mono text-muted-foreground uppercase">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Sandeep Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 h-11 bg-secondary/40 border-border/60 text-sm rounded-xl focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-mono text-muted-foreground uppercase">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="adminsandeep@gamil.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11 bg-secondary/40 border-border/60 text-sm rounded-xl focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-mono text-muted-foreground uppercase">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-11 bg-secondary/40 border-border/60 text-sm rounded-xl focus:border-cyan-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-sky-400 via-cyan-500 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-950/40 transition-all active:scale-[0.98] mt-2"
              >
                {loading ? (
                  "Authenticating..."
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {mode === "login" ? "Sign In to Dashboard" : "Create Account"}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Admin Quick Fill Helper */}
            <div className="pt-2 border-t border-border/40">
              <button
                type="button"
                onClick={handleAutofillAdmin}
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center justify-between transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  Autofill Admin Credentials
                </span>
                <span className="text-[10px] text-cyan-400/80 group-hover:underline">Fill & Sign In</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
