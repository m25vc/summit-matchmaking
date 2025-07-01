import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { founderFormSchema, type FounderFormValues } from "@/schemas/profileSchemas";
import { toast } from "sonner";

interface FounderFormProps {
  defaultValues?: Partial<FounderFormValues>;
  onSubmit: (values: FounderFormValues) => Promise<void>;
  showSubmitButton?: boolean;
  setIsSaving?: (saving: boolean) => void;
}

export const FounderForm = forwardRef<HTMLFormElement, FounderFormProps>(
  ({ defaultValues, onSubmit, showSubmitButton = true, setIsSaving }, ref) => {
    const form = useForm<FounderFormValues>({
      resolver: zodResolver(founderFormSchema),
      defaultValues: defaultValues || {},
      mode: 'onChange',
      reValidateMode: 'onChange',
    });

    return (
      <Form {...form}>
        <form
          ref={ref}
          onSubmit={form.handleSubmit(
            onSubmit,
            (errors) => {
              if (typeof setIsSaving === 'function') setIsSaving(false);
              toast.error("Please fix the errors in the form before saving.");
            }
          )}
          className="space-y-6"
        >
          {/* Personal Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your last name" className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your job title" className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Preferred Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email address" className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">LinkedIn Profile URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/..." className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Company Overview Section (combined) */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Overview</h3>
            <FormField
              control={form.control}
              name="companyDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">One Line Company Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your company..."
                      className="min-h-[120px] text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. SaaS, Fintech, Healthcare" className="text-base" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyWebsiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Company Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." className="text-base" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastRoundRaised"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Most Recent Round Raised</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-base">
                          <SelectValue placeholder="Select most recent round" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                        <SelectItem value="Seed">Seed</SelectItem>
                        <SelectItem value="Seed+">Seed+</SelectItem>
                        <SelectItem value="Series A">Series A</SelectItem>
                        <SelectItem value="Series B">Series B</SelectItem>
                        <SelectItem value="Series C">Series C</SelectItem>
                        <SelectItem value="Series D">Series D</SelectItem>
                        <SelectItem value="Series E">Series E</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Current Annual Revenue</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-base">
                          <SelectValue placeholder="Select revenue" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="< $1M">&lt; $1M</SelectItem>
                        <SelectItem value="$1M - $3M">$1M - $3M</SelectItem>
                        <SelectItem value="$3M - $5M">$3M - $5M</SelectItem>
                        <SelectItem value="> $5M">&gt; $5M</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nextRaisePlanned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">When Do You Plan to Raise Again?</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Q4 2025, Not sure, After product launch, etc." className="text-base" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information you'd like to share..."
                      className="min-h-[80px] text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {showSubmitButton && (
            <Button type="submit" className="w-full text-base font-medium py-3">Save Profile</Button>
          )}
          {/* Hidden submit button for sticky save functionality */}
          <button type="submit" className="hidden" />
        </form>
      </Form>
    );
  }
);
