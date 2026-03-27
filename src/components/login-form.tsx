"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon } from "./ui/arrow-left";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";


const schema = z.object({
  licenseKey: z
    .string()
    .min(10, "License key is too short")
    .max(500, "License key is too long"),
});

type FormData = z.infer<typeof schema>;


type LoginFormProps = {
  onBack?: () => void;
  onSuccess?: (data: any) => void;
};

export function LoginForm({
  className,
  onBack,
  onSuccess,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & LoginFormProps) {


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      licenseKey: ""
    },
  });


  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      try {
        
        const license = await fetchLicenseInfo(data.licenseKey)
  
        return license
      } catch (error) {
        console.log(error)
      }
    },
    onSuccess: (data) => {
      if (data.valid) {
        onSuccess?.(data);
      }
    },
  });

  const fetchLicenseInfo = async (license: string) => {

      const API_URL = 'https://heybible-server-jzxz.onrender.com/api'

      try {
        const res = await fetch(`${API_URL}/verify/check` , {
          method: "POST",
          body: JSON.stringify({ license }),
          headers: {
            "Content-Type": "application/json"
          }
        })

        const data = await res.json()

        if(!data.valid){
          throw new Error(data.error)
        }
        
        return data
      } catch (error) {
        toast.error((error as any).message)
      }
  }

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        "flex flex-1 flex-col items-center justify-between gap-6 p-4",
        className
      )}
      {...props}
    >
      {/* Back button */}
      <div className="w-full">
        <Button onClick={onBack} type="button" variant="secondary">
          <ArrowLeftIcon />
          <p>Back</p>
        </Button>
      </div>

      {/* Form */}
      <FieldGroup className="w-full md:w-100">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Activate HeyBible</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your License key
          </p>
        </div>

        {/* License Key */}
        <Field>
          <FieldLabel htmlFor="licenseKey">License Key</FieldLabel>
          <Input
            id="licenseKey"
            className="bg-background"
            placeholder="Enter your license key"
            {...register("licenseKey")}
          />
          {errors.licenseKey && (
            <p className="text-sm text-red-500">
              {errors.licenseKey.message}
            </p>
          )}
        </Field>

        {/* Submit */}
        <Field>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Checking..." : "Check"}
          </Button>
        </Field>

        {/* Error state */}
        {mutation.isError && (
          <p className="text-sm text-red-500 text-center">
            Failed to activate license
          </p>
        )}

        {/* Invalid license */}
        {mutation.data && !mutation.data.valid && (
          <p className="text-sm text-red-500 text-center">
            Invalid license key
          </p>
        )}
      </FieldGroup>

      <div />
    </form>
  );
}