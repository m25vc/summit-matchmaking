import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface RegistrationFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}

// Password strength checker
const checkPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  
  if (score <= 2) return { strength: 'weak', color: 'text-red-500', bgColor: 'bg-red-100' };
  if (score <= 3) return { strength: 'medium', color: 'text-yellow-500', bgColor: 'bg-yellow-100' };
  return { strength: 'strong', color: 'text-green-500', bgColor: 'bg-green-100' };
};

const RegistrationForm = ({ loading, setLoading, onSuccess }: RegistrationFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [userType, setUserType] = useState<'founder' | 'investor'>('founder');
  const [companyName, setCompanyName] = useState('');
  
  // Form validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Modal state
  const [showUnapprovedEmailModal, setShowUnapprovedEmailModal] = useState(false);

  // Password strength
  const passwordStrength = checkPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? '' : 'Please enter a valid email address';
      case 'password':
        if (value.length < 8) return 'Password must be at least 8 characters long';
        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/\d/.test(value)) return 'Password must contain at least one number';
        return '';
      case 'confirmPassword':
        return value === password ? '' : 'Passwords do not match';
      case 'firstName':
      case 'lastName':
      case 'jobTitle':
      case 'companyName':
        return value.trim().length > 0 ? '' : 'This field is required';
      default:
        return '';
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    // Update the field value
    switch (name) {
      case 'email': setEmail(value); break;
      case 'password': setPassword(value); break;
      case 'confirmPassword': setConfirmPassword(value); break;
      case 'firstName': setFirstName(value); break;
      case 'lastName': setLastName(value); break;
      case 'jobTitle': setJobTitle(value); break;
      case 'companyName': setCompanyName(value); break;
    }

    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const checkEmailAllowed = async (email: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      console.log("Checking email:", normalizedEmail);
      
      // First, let's see what's in the database for this email
      const { data: allMatches, error: searchError } = await supabase
        .from('allowed_emails')
        .select('*')
        .eq('email', normalizedEmail);
      
      if (searchError) {
        console.error("Error searching for email:", searchError);
        return false;
      }
      
      console.log("All matches for email:", allMatches);
      
      // Check if any of the matches are active
      const activeMatch = allMatches?.find(match => match.active === true);
      
      if (activeMatch) {
        console.log("Found active email in allowlist:", activeMatch);
        return true;
      } else {
        console.log("Email not found or not active in allowlist:", normalizedEmail);
        if (allMatches && allMatches.length > 0) {
          console.log("Inactive matches found:", allMatches);
        }
        return false;
      }
    } catch (error) {
      console.error("Error checking email allowlist:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate all fields
      const fieldValidations = [
        { name: 'email', value: email },
        { name: 'password', value: password },
        { name: 'confirmPassword', value: confirmPassword },
        { name: 'firstName', value: firstName },
        { name: 'lastName', value: lastName },
        { name: 'jobTitle', value: jobTitle },
        { name: 'companyName', value: companyName },
      ];

      const newErrors: Record<string, string> = {};
      fieldValidations.forEach(({ name, value }) => {
        const error = validateField(name, value);
        if (error) newErrors[name] = error;
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setTouched(prev => ({
          ...prev,
          email: true,
          password: true,
          confirmPassword: true,
          firstName: true,
          lastName: true,
          jobTitle: true,
          companyName: true,
        }));
        setLoading(false);
        toast.error("Please fix the errors in the form");
        return;
      }

      // Check if email is in the allowed list
      const isEmailAllowed = await checkEmailAllowed(email);
      console.log("Signup attempted with email:", email);
      console.log("checkEmailAllowed result:", isEmailAllowed);
      
      if (!isEmailAllowed) {
        setLoading(false);
        setShowUnapprovedEmailModal(true);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            job_title: jobTitle,
            user_type: userType,
            company_name: companyName,
          },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (error) throw error;
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) throw signInError;
      
      onSuccess();
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
              disabled={loading}
              className={touched.email && errors.email ? 'border-red-500' : ''}
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                disabled={loading}
                className={touched.password && errors.password ? 'border-red-500' : ''}
              />
              {password && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${passwordStrength.bgColor}`}></div>
                    <span className={`text-sm ${passwordStrength.color}`}>
                      Password strength: {passwordStrength.strength}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className={password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                      {password.length >= 8 ? '✓' : '○'} At least 8 characters
                    </div>
                    <div className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                      {/[a-z]/.test(password) ? '✓' : '○'} Lowercase letter
                    </div>
                    <div className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                      {/[A-Z]/.test(password) ? '✓' : '○'} Uppercase letter
                    </div>
                    <div className={/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                      {/\d/.test(password) ? '✓' : '○'} Number
                    </div>
                  </div>
                </div>
              )}
              {touched.password && errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                required
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                disabled={loading}
                className={touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : ''}
              />
              {confirmPassword && (
                <div className="mt-1">
                  <span className={`text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </span>
                </div>
              )}
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <Input
                id="firstName"
                type="text"
                required
                placeholder="First Name"
                value={firstName}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, firstName: true }))}
                disabled={loading}
                className={touched.firstName && errors.firstName ? 'border-red-500' : ''}
              />
              {touched.firstName && errors.firstName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <Input
                id="lastName"
                type="text"
                required
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, lastName: true }))}
                disabled={loading}
                className={touched.lastName && errors.lastName ? 'border-red-500' : ''}
              />
              {touched.lastName && errors.lastName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>
          
          {/* Job Title */}
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
              Job Title
            </label>
            <Input
              id="jobTitle"
              type="text"
              required
              placeholder="Job Title"
              value={jobTitle}
              onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, jobTitle: true }))}
              disabled={loading}
              className={touched.jobTitle && errors.jobTitle ? 'border-red-500' : ''}
            />
            {touched.jobTitle && errors.jobTitle && (
              <p className="mt-1 text-sm text-red-600">
                {errors.jobTitle}
              </p>
            )}
          </div>
          
          {/* User Type Selection */}
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">I am a:</Label>
            <Select
              value={userType}
              onValueChange={(value: 'founder' | 'investor') => setUserType(value)}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="founder">Founder</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Company/Firm Name */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              {userType === 'founder' ? 'Company Name' : 'Firm Name'}
            </label>
            <Input
              id="companyName"
              type="text"
              required
              placeholder={userType === 'founder' ? 'Company Name' : 'Firm Name'}
              value={companyName}
              onChange={(e) => handleFieldChange('companyName', e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, companyName: true }))}
              disabled={loading}
              className={touched.companyName && errors.companyName ? 'border-red-500' : ''}
            />
            {touched.companyName && errors.companyName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.companyName}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !passwordsMatch || passwordStrength.strength === 'weak'}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </div>
      </form>

      {/* Unapproved Email Modal */}
      <Dialog open={showUnapprovedEmailModal} onOpenChange={setShowUnapprovedEmailModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-gray-900">
              Email Not Approved
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-4">
              <div className="space-y-4">
                <p>
                  The email address <strong>{email}</strong> is not on our approved list.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>What to do next:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Make sure you're using the email address you registered with</li>
                    <li>• If you haven't registered yet, contact us at <a href="mailto:events@m25vc.com" className="underline">events@m25vc.com</a></li>
                  </ul>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-6">
            <Button 
              onClick={() => setShowUnapprovedEmailModal(false)}
              className="px-6"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RegistrationForm;
