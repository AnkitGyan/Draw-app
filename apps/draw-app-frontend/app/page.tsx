"use client";

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import {
  Pencil,
  Share2,
  Users2,
  Sparkles,
  Download,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
              Collaborative Whiteboarding
              <span className="text-primary block">
                Made Simple
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Create, collaborate, and share beautiful diagrams
              and sketches with our intuitive drawing tool.
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              {!isLoggedIn ? (
                <>
                  <Link href="/signin">
                    <Button
                      variant="primary"
                      size="lg"
                      className="h-12 px-6"
                    >
                      Sign In
                      <Pencil className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>

                  <Link href="/signup">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 px-6"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="primary"
                      size="lg"
                      className="h-12 px-6"
                    >
                      Go to Dashboard
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={logout}
                  >
                    Logout
                    <LogOut className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">

            <Card className="p-6 border-2 hover:border-primary transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Share2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">
                  Real-time Collaboration
                </h3>
              </div>

              <p className="mt-4 text-muted-foreground">
                Work together with your team in real-time.
              </p>
            </Card>

            <Card className="p-6 border-2 hover:border-primary transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">
                  Multiplayer Editing
                </h3>
              </div>

              <p className="mt-4 text-muted-foreground">
                Multiple users can edit the same canvas simultaneously.
              </p>
            </Card>

            <Card className="p-6 border-2 hover:border-primary transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">
                  Smart Drawing
                </h3>
              </div>

              <p className="mt-4 text-muted-foreground">
                Intelligent shape recognition and drawing assistance.
              </p>
            </Card>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2026 Draw-App. All rights reserved.
            </p>

            <Download className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;