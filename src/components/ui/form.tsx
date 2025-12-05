'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import { motion } from 'framer-motion';
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

interface FormItemProps extends React.ComponentProps<'div'> {
  animated?: boolean;
}

function FormItem({ className, animated = true, ...props }: FormItemProps) {
  // Extract animated from props to prevent it from being passed to DOM
  const { animated: _, ...domProps } = { animated, ...props };
  const id = React.useId();

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const formItemClasses = cn('grid gap-2', className);

  if (animated) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onDrag, onDragEnd, onDragStart, ...motionProps } = domProps as any;
    return (
      <FormItemContext.Provider value={{ id }}>
        <motion.div
          data-slot="form-item"
          className={formItemClasses}
          variants={itemVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeOut" }}
          {...motionProps}
        />
      </FormItemContext.Provider>
    );
  }

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={formItemClasses}
        {...domProps}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn('data-[error=true]:text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

interface FormDescriptionProps extends React.ComponentProps<'p'> {
  animated?: boolean;
}

function FormDescription({ className, animated = true, ...props }: FormDescriptionProps) {
  // Extract animated from props to prevent it from being passed to DOM
  const { animated: _, ...domProps } = { animated, ...props };
  const { formDescriptionId } = useFormField();

  const descriptionVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  const descriptionClasses = cn('text-muted-foreground text-sm', className);

  if (animated) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onDrag, onDragEnd, onDragStart, ...motionProps } = domProps as any;
    return (
      <motion.p
        data-slot="form-description"
        id={formDescriptionId}
        className={descriptionClasses}
        variants={descriptionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
        {...motionProps}
      />
    );
  }

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={descriptionClasses}
      {...domProps}
    />
  );
}

interface FormMessageProps extends React.ComponentProps<'p'> {
  animated?: boolean;
}

function FormMessage({ className, animated = true, ...props }: FormMessageProps) {
  // Extract animated from props to prevent it from being passed to DOM
  const { animated: _, ...domProps } = { animated, ...props };
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : domProps.children;

  if (!body) {
    return null;
  }

  const messageVariants = {
    initial: { opacity: 0, y: 10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 }
  };

  const messageClasses = cn('text-destructive text-xs font-medium', className);

  if (animated) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onDrag, onDragEnd, onDragStart, ...motionProps } = domProps as any;
    return (
      <motion.p
        data-slot="form-message"
        id={formMessageId}
        className={messageClasses}
        variants={messageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2, ease: "easeOut" }}
        {...motionProps}
      >
        {body}
      </motion.p>
    );
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={messageClasses}
      {...domProps}
    >
      {body}
    </p>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
