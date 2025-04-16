import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Login form state
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });

  // If user is already logged in, redirect to home page
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.username || !loginData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    loginMutation.mutate(loginData);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.username || !registerData.password || !registerData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    registerMutation.mutate({
      username: registerData.username,
      password: registerData.password
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="grid w-full max-w-6xl grid-cols-1 gap-4 px-4 md:grid-cols-2 md:gap-8">
        {/* Hero Section */}
        <div className="flex flex-col justify-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Data Ingestion Tool</h1>
          <p className="text-xl text-muted-foreground">
            A powerful bidirectional data transfer tool between ClickHouse database and flat files with multi-table join capabilities.
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center">
              <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Import data from flat files to ClickHouse
            </li>
            <li className="flex items-center">
              <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Export ClickHouse data to flat files
            </li>
            <li className="flex items-center">
              <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Preview data before ingestion
            </li>
            <li className="flex items-center">
              <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Save configurations for reuse
            </li>
          </ul>
        </div>

        {/* Auth Form */}
        <div className="flex flex-col justify-center">
          <Card>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>Sign in to access the data ingestion tool</CardDescription>
            </CardHeader>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit}>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input 
                        id="login-username" 
                        type="text" 
                        placeholder="Username" 
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input 
                        id="login-password" 
                        type="password" 
                        placeholder="Password" 
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending || isLoading}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleRegisterSubmit}>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input 
                        id="register-username" 
                        type="text" 
                        placeholder="Choose a username" 
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input 
                        id="register-password" 
                        type="password" 
                        placeholder="Choose a password" 
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Confirm Password</Label>
                      <Input 
                        id="register-confirm-password" 
                        type="password" 
                        placeholder="Confirm your password" 
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending || isLoading}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}