/**
 * Issue Report Form Page
 * Allows users to submit issue reports which will be automatically classified for priority
 */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api-client";
import { Loader2, AlertCircle, Send, HelpCircle, Sparkles, Upload, X, Image as ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000, "Description must be less than 5000 characters"),
  symptoms: z.string().optional(),
  diagnostic_context: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function ReportIssue() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      symptoms: "",
      diagnostic_context: "",
    },
  });

  // Pre-fill form from URL query parameters
  useEffect(() => {
    const title = searchParams.get("title");
    const description = searchParams.get("description");
    const symptoms = searchParams.get("symptoms");
    const diagnostic_context = searchParams.get("diagnostic_context");

    if (title) form.setValue("title", decodeURIComponent(title));
    if (description) form.setValue("description", decodeURIComponent(description));
    if (symptoms) form.setValue("symptoms", decodeURIComponent(symptoms));
    if (diagnostic_context) form.setValue("diagnostic_context", decodeURIComponent(diagnostic_context));
  }, [searchParams, form]);

  // Handle screenshot file selection
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (PNG, JPG, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setScreenshot(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle screenshot removal
  const handleRemoveScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
  };

  const onSubmit = async (data: FormData) => {
    if (!user || !userProfile) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit an issue report.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert symptoms string to array
      const symptomsArray = data.symptoms
        ? data.symptoms.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
        : [];

      // Convert diagnostic_context string to object if provided
      let diagnosticContext = {};
      if (data.diagnostic_context) {
        try {
          diagnosticContext = JSON.parse(data.diagnostic_context);
        } catch {
          // If not valid JSON, store as string in a key
          diagnosticContext = { note: data.diagnostic_context };
        }
      }

      // Convert screenshot to base64 if present
      let screenshotBase64 = null;
      if (screenshot) {
        screenshotBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(screenshot);
        });
      }

      const requestData = {
        title: data.title,
        description: data.description,
        user_id: userProfile.client_id || userProfile.id || user.id,
        client_email: user.email,
        symptoms: symptomsArray,
        diagnostic_context: diagnosticContext,
        ...(screenshotBase64 && { screenshot_base64: screenshotBase64 }),
      };

      const response = await apiRequest<{
        success: boolean;
        data: {
          ticket_id: string;
          help_center_link: string;
          priority_classification?: {
            classified_priority: string;
            reasoning: string;
          };
        };
        error?: string;
      }>("/api/v1/tickets/create-from-form", {
        method: "POST",
        body: JSON.stringify(requestData),
        requiresAuth: true,
      });

      if (response.success) {
        toast({
          title: "Issue reported successfully!",
          description: `Your ticket has been created and classified as ${response.data.priority_classification?.classified_priority || "Unknown"}.`,
        });

        // Redirect to ticket details page
        setTimeout(() => {
          navigate(`/tickets/${response.data.ticket_id}`);
        }, 1500);
      } else {
        throw new Error(response.error || "Failed to create ticket");
      }
    } catch (error) {
      console.error("Error submitting issue report:", error);
      toast({
        title: "Failed to submit issue report",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              Please log in to submit an issue report.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Report an Issue</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're here to help! Fill out the form below and our AI system will automatically prioritize your issue and create a ticket for you.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm">
            <Sparkles className="h-4 w-4" />
            <span>AI-powered priority classification</span>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-blue-600" />
              Issue Details
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Please provide as much detail as possible. The more information you give us, the better we can understand and prioritize your issue.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., System not responding, OCR feature broken"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief, descriptive title for your issue.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the issue in detail. Include what you were trying to do, what happened, and any error messages you saw..."
                          className="min-h-[150px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Detailed description helps us understand and prioritize your issue better.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symptoms (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Error 500, Blank screen, Slow loading, Feature not working"
                          className="min-h-[100px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        List any specific symptoms or error messages you've observed. Separate multiple items with commas.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diagnostic_context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Context (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information that might help diagnose the issue (environment, steps to reproduce, etc.)"
                          className="min-h-[100px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Any additional context, steps to reproduce, or environmental information.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Screenshot Upload Field */}
                <div className="space-y-2">
                  <FormLabel>Screenshot (Optional)</FormLabel>

                  {!screenshotPreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <label htmlFor="screenshot-upload" className="cursor-pointer block">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                            <Upload className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Click to upload screenshot
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                        </div>
                        <input
                          id="screenshot-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotChange}
                          disabled={isSubmitting}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="relative border-2 border-gray-200 rounded-lg p-4">
                      <button
                        type="button"
                        onClick={handleRemoveScreenshot}
                        disabled={isSubmitting}
                        className="absolute top-2 right-2 p-1 bg-red-100 hover:bg-red-200 rounded-full text-red-600 transition-colors"
                        aria-label="Remove screenshot"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <ImageIcon className="h-10 w-10 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {screenshot?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {screenshot && (screenshot.size / 1024).toFixed(1)} KB
                          </p>
                          {screenshotPreview && (
                            <img
                              src={screenshotPreview}
                              alt="Screenshot preview"
                              className="mt-2 max-h-40 rounded border border-gray-200"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <FormDescription>
                    Upload a screenshot to help us understand the issue better.
                  </FormDescription>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Ticket...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Issue Report
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="mt-6 shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Priority Classification Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-red-700 text-base">P0 (Critical)</strong>
                  <p className="text-gray-700 mt-1">Production down, data loss, security breach</p>
                  <p className="text-sm text-gray-600 mt-1">⚡ Response: 30 min | 🔧 Resolution: 8 hours</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg border-l-4 border-orange-500 bg-orange-50">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-orange-700 text-base">P1 (High)</strong>
                  <p className="text-gray-700 mt-1">Major functionality broken, no workaround</p>
                  <p className="text-sm text-gray-600 mt-1">⚡ Response: 1 hour | 🔧 Resolution: 24 hours</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-50">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-yellow-700 text-base">P2 (Medium)</strong>
                  <p className="text-gray-700 mt-1">Minor issues, workarounds available</p>
                  <p className="text-sm text-gray-600 mt-1">⚡ Response: 12 hours</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-blue-700 text-base">P3 (Low)</strong>
                  <p className="text-gray-700 mt-1">Feature requests, enhancements</p>
                  <p className="text-sm text-gray-600 mt-1">⚡ Response: As required</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
