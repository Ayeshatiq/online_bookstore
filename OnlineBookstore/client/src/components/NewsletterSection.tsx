import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { insertSubscriberSchema } from "@shared/schema";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (email: string) => {
      await apiRequest("POST", "/api/newsletter/subscribe", { email });
    },
    onSuccess: () => {
      toast({
        title: "Subscribed!",
        description: "You have been successfully subscribed to our newsletter.",
      });
      setEmail("");
    },
    onError: (error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      insertSubscriberSchema.parse({ email });
      mutation.mutate(email);
    } catch (error: any) {
      toast({
        title: "Validation error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-10 bg-primary-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="mb-6 md:mb-0 md:w-1/2 lg:w-3/5">
            <h2 className="text-2xl font-title font-bold mb-2 text-black">Join Our Book Club</h2>
            <p className="text-black font-medium">
              Subscribe to get personalized recommendations, exclusive offers, and updates on new releases.
            </p>
          </div>
          <div className="md:w-1/2 lg:w-2/5">
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
              <Input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2 rounded-md flex-1 text-gray-800 bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="bg-secondary-500 hover:bg-secondary-600 px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap text-black"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Subscribing..." : "Subscribe Now"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
