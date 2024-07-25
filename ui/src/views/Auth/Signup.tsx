import { Button } from "@/components/ui/button";
import { Anchor, Group, PasswordInput, TextInput, rem } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertTriangle } from "@tabler/icons-react";
import classes from "./InputValidation.module.css";

function SignUp() {
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length >= 6
          ? null
          : "Password must be at least 6 characters long",
    },
  });

  return (
    <div className="flex items-center justify-center w-full h-full bg-cover bg-center p-6">
      <div className="w-full max-w-[350px] p-6 bg-white rounded-lg shadow-md">
        <img src="/logo2.svg" alt="Logo" className="w-24 h-auto mx-auto mb-6" />

        <form onSubmit={form.onSubmit((values) => console.log(values))}>
          <TextInput
            label="Email"
            placeholder="hello@gmail.com"
            required
            {...form.getInputProps("email")}
            rightSection={
              form.errors.email && (
                <IconAlertTriangle
                  stroke={1.5}
                  style={{ width: rem(18), height: rem(18) }}
                  className={classes.icon}
                />
              )
            }
            error={form.errors.email}
            mb="md"
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            {...form.getInputProps("password")}
            error={form.errors.password}
            mb="md"
          />

          <Button type="submit" className="w-full" color="primary">
            Sign Up
          </Button>
        </form>

        <Group mt="md">
          <Anchor
            href="#"
            onClick={(event) => event.preventDefault()}
            fw={500}
            fz="sm"
          >
            Already have an account?
          </Anchor>
        </Group>
      </div>
    </div>
  );
}

export default SignUp;
