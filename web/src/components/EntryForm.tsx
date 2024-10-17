import { Button } from './ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const entrySchema = z
  .object({
    title: z.string().min(2, {
      message: 'Title must be at least 2 characters.',
    }),
    description: z.string().min(3, {
      message: 'Description must be at least 3 characters.',
    }),
    type: z.enum(['login', 'password', 'note']),
    note: z.string().optional(),
    password: z
      .string()
      .min(8, {
        message: 'Password must be at least 8 characters.',
      })
      .optional(),
    username: z
      .string()
      .min(2, {
        message: 'Username must be at least 2 characters.',
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'password') {
        return !!data.password; // Password must exist
      }
      return true;
    },
    {
      message: "Password is required for type 'Password'",
      path: ['password'], // Path to show the error for repeatPassword
    },
  )
  .refine(
    (data) => {
      if (data.type === 'login') {
        return !!data.username; // Username must exist
      }
      return true;
    },
    {
      message: "Username is required for type 'Login'",
      path: ['username'], // Path to show the error for repeatPassword
    },
  );

export type NewEntryType = z.infer<typeof entrySchema>;

type EntryFormProps = {
  onSubmitForm: (data: z.infer<typeof entrySchema>) => void;
};

const EntryForm: React.FC<EntryFormProps> = ({ onSubmitForm }) => {
  const form = useForm<z.infer<typeof entrySchema>>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'login',
      username: '',
      password: '',
      note: '',
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof entrySchema>> = (data) => {
    console.log('Form Submitted:', data);
    onSubmitForm(data);
  };

  const type = form.watch('type');

  return (
    <div>
      <h1>New Entry</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a verified email to display" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="login">Full login</SelectItem>
                    <SelectItem value="password">Password Only</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {type === 'login' && (
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {['login', 'password'].includes(type) && (
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
          )}
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Create</Button>
        </form>
      </Form>
    </div>
  );
};

export default EntryForm;
