import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ArrowLeftIcon } from "./ui/arrow-left"

type LoginFormProps = {
  onBack?: () => void,
  onSubmit?: () => void
}

export function LoginForm({
  className,
  onBack,
  onSubmit,
  ...props
}: Omit<React.ComponentProps<"form"> , "onSubmit"> & LoginFormProps) {

  return (
    <form className={cn("flex flex-1 flex-col items-center justify-between gap-6 p-4", className)} {...props}>
      <div className="w-full">
        <Button onClick={onBack} type="button" variant={'secondary'}>
          <ArrowLeftIcon />
          <p>Back</p>
        </Button>
      </div>
      <FieldGroup className="w-full md:w-100">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Authenticate</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your product key
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            className="bg-background"
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            {/* <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a> */}
          </div>
          <Input
            id="password"
            type="password"
            required
            className="bg-background"
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">License Key</FieldLabel>
          </div>
          <Input
            id="licenseKey"
            type="licenseKey"
            required
            className="bg-background"
            placeholder="HB_1234567890"
          />
        </Field>

        <Field>
          <Button type="submit">Activate</Button>
        </Field>
      </FieldGroup>

      <div></div>
    </form>
  )
}
