import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logoutMutation, isLoading } = useAuth();

  return (
    <header className="border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-lg">
            Data Ingestion Tool
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={logoutMutation.isPending}
                  onClick={() => logoutMutation.mutate()}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  {logoutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" asChild>
              <Link href="/auth">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}