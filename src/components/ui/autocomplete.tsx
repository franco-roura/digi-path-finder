import { Command as CommandPrimitive } from "cmdk";
import { useMemo, useState } from "react";

import { Input } from "./input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";
import { Skeleton } from "./skeleton";

type Props<T extends string> = {
  selectedValue: T;
  onSelectedValueChange: (value: T) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  items: { value: T; label: string }[];
  isLoading?: boolean;
  emptyMessage?: string;
  placeholder?: string;
  renderLabel?: (value: T) => React.ReactNode;
};

export const AutoComplete = <T extends string>(props: Props<T>) => {
  const [open, setOpen] = useState(false);

  const labels = useMemo(
    () =>
      props.items.reduce(
        (acc, item) => {
          acc[item.value] = item.label;
          return acc;
        },
        {} as Record<string, string>
      ),
    [props.items]
  );

  const reset = () => {
    props.onSelectedValueChange("" as T);
    props.onSearchValueChange("");
  };

  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setOpen(false);
    if (
      !e.relatedTarget?.hasAttribute("cmdk-list") &&
      !e.relatedTarget?.hasAttribute("cmdk-input") &&
      !props.selectedValue
    ) {
      reset();
    }
  };

  const onSelectItem = (inputValue: string) => {
    if (inputValue === props.selectedValue) {
      reset();
    } else {
      props.onSelectedValueChange(inputValue as T);
      props.onSearchValueChange(labels[inputValue] ?? "");
    }
    setOpen(false);
  };

  return (
    <div className="flex items-center">
      <Popover
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen);
          if (
            !newOpen &&
            props.selectedValue &&
            labels[props.selectedValue] !== props.searchValue
          ) {
            props.onSearchValueChange(labels[props.selectedValue] ?? "");
          }
        }}
      >
        <Command shouldFilter={false}>
          <PopoverAnchor asChild>
            <CommandPrimitive.Input
              asChild
              value={props.searchValue}
              onValueChange={props.onSearchValueChange}
              onKeyDown={(e) => setOpen(e.key !== "Escape")}
              onMouseDown={() =>
                setOpen((open) => !!props.searchValue || !open)
              }
              onFocus={() => setOpen(true)}
              onBlur={onInputBlur}
            >
              <Input placeholder={props.placeholder} />
            </CommandPrimitive.Input>
          </PopoverAnchor>
          {!open && <CommandList aria-hidden="true" className="hidden" />}
          <PopoverContent
            asChild
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (
                e.target instanceof Element &&
                e.target.hasAttribute("cmdk-input")
              ) {
                e.preventDefault();
              }
            }}
            className="w-[--radix-popover-trigger-width] p-0"
          >
            <CommandList>
              {props.isLoading && (
                <CommandPrimitive.Loading>
                  <div className="p-1">
                    <Skeleton className="h-6 w-full" />
                  </div>
                </CommandPrimitive.Loading>
              )}
              {props.items.length > 0 && !props.isLoading ? (
                <CommandGroup>
                  {props.items.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onMouseDown={(e) => e.preventDefault()}
                      onSelect={onSelectItem}
                    >
                      {props.renderLabel
                        ? props.renderLabel(option.value)
                        : option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
              {!props.isLoading ? (
                <CommandEmpty>{props.emptyMessage ?? "No items."}</CommandEmpty>
              ) : null}
            </CommandList>
          </PopoverContent>
        </Command>
      </Popover>
    </div>
  );
};
