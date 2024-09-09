import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { Button } from './ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from './ui/form';
import { Input } from './ui/input';

// Define a reusable schema for the common fields (email and password)
const baseSchema = z.object({
  email: z.string().min(3, {
    message: 'Email must be at least 3 characters.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
});

// Define the signup form schema by extending the base schema
const signupFormSchema = baseSchema
  .extend({
    repeatPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords don't match",
    path: ['repeatPassword'], // Path to show the error for repeatPassword
  });

// Define the login form schema by reusing the base schema
const loginFormSchema = baseSchema;

type SignUpInputs = z.infer<typeof signupFormSchema>;
type LoginInputs = z.infer<typeof loginFormSchema>;

type LoginFormProps = {
  formType: 'login' | 'signup';
  onSubmitForm: (data: SignUpInputs | LoginInputs) => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ formType, onSubmitForm }) => {
  // Dynamically choose the schema and form values based on the form type
  const schema = formType === 'signup' ? signupFormSchema : loginFormSchema;

  // Dynamically infer the form input types based on form type
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      ...(formType === 'signup' && { repeatPassword: '' }),
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = (data) => {
    console.log('Form Submitted:', data);
    onSubmitForm(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input placeholder="example@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Conditionally render the repeat password field only for signup */}
        {formType === 'signup' && (
          <FormField
            control={form.control}
            name="repeatPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repeat Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit">{formType === 'signup' ? 'Sign Up' : 'Log In'}</Button>
      </form>
    </Form>
  );
};

export default LoginForm;
