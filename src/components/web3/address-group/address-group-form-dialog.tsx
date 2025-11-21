"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, X, Upload } from 'lucide-react'
import { CreateAddressGroupRequest } from '@/types/address-group'

interface AddressGroupFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateAddressGroupRequest) => void
  isSubmitting: boolean
  mode?: "create" | "edit";
  initialData?: {
    name: string;
    description?: string;
    addresses: string[];
  } | null;
}

export function AddressGroupFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  mode = "create",
  initialData,
}: AddressGroupFormDialogProps) {
  const [addresses, setAddresses] = useState<string[]>([''])
  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [errors, setErrors] = useState<{
    addresses?: string
    name?: string
    description?: string
  }>({})
  const csvInputRef = useRef<HTMLInputElement | null>(null);

  // Load initial data for edit mode
  useEffect(() => {
    if (open && mode === "edit" && initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
      setAddresses(initialData.addresses.length ? initialData.addresses : []);
      setErrors({});
    }

    if (!open) {
      setName("");
      setDescription("");
      setAddresses([]);
      setErrors({});
    }
  }, [open, mode, initialData]);

  const handleAddAddress = useCallback(() => {
    setAddresses(prev => [...prev, ''])
  }, [])

  const handleRemoveAddress = useCallback((index: number) => {
    setAddresses(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleAddressChange = useCallback((index: number, value: string) => {
    setAddresses(prev => {
      const newAddresses = [...prev]
      newAddresses[index] = value
      return newAddresses
    })
    if (errors.addresses) {
      setErrors(prev => ({ ...prev, addresses: undefined }))
    }
  }, [errors.addresses])

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      // Parse CSV rows
      const rows = text
        .split(/\r?\n/)            // split rows
        .map(r => r.trim())
        .filter(r => r.length > 0);

      if (rows.length === 0) {
        setErrors(prev => ({
          ...prev,
          addresses: "CSV file is empty."
        }));
        return;
      }
      // remove column header if present
      const headerPattern = /^0x[a-fA-F0-9]{40}$/;
      if (rows.length > 0 && !headerPattern.test(rows[0])) {
        rows.shift();
      }
      // Remove duplicates across CSV + existing inputs
      const unique = Array.from(new Set([...addresses, ...rows]));

      setAddresses(unique);

      // Clear errors
      setErrors(prev => ({ ...prev, addresses: "" }));
    };

    reader.readAsText(file);
    if (csvInputRef.current) {
      csvInputRef.current.value = "";
    }
  };


  const validateForm = useCallback((): boolean => {
    const newErrors: typeof errors = {}

    // Validate addresses
    const validAddresses = addresses.filter(addr => addr.trim() !== '')
    if (validAddresses.length === 0) {
      newErrors.addresses = 'At least one valid address is required'
    } else {
      // Basic address validation
      const invalidAddresses = validAddresses.filter(addr => {
        return !addr.match(/^0x[a-fA-F0-9]{40}$/)
      })
      if (invalidAddresses.length > 0) {
        newErrors.addresses = 'All addresses must be valid addresses (0x...)'
      }

      // validate name
      if (name.trim() === '') {
        newErrors.name = 'Group name is required'
      }

    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [addresses, name])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const validAddresses = addresses.filter(addr => addr.trim() !== '')
      onSubmit({
        addresses: validAddresses,
        name: name.trim(),
        description: description.trim() || undefined
      })
    }
  }, [validateForm, addresses, name, description, onSubmit])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "edit" ? "Edit Address Group" : "Create Address Group"}
            </DialogTitle>
            <DialogDescription>
              {mode === "edit" ?
                "Update group information and addresses." :
                "Monitor blockchain addresses for activity and send notifications to selected groups and subscribers."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Name Section */}
            <div className="grid gap-3">
              <Label className="text-left font-semibold">
                Group Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="My Address Group"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.addresses ? 'border-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Description Section */}
            <div className="grid gap-3">
              <Label className="text-left font-semibold">
                Description
              </Label>
              <Input
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Addresses Section */}
            <div className="grid gap-3">
              <Label className="text-left font-semibold">
                Addresses <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground -mt-2">
                Add one or more addresses to get notifications
              </p>
              <div className="
              space-y-2 max-h-36 overflow-y-auto pr-1"
              >
                {addresses.map((address, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="0x..."
                      value={address}
                      onChange={(e) => handleAddressChange(index, e.target.value)}
                      className={errors.addresses ? 'border-destructive' : ''}
                      disabled={isSubmitting}
                    />
                    {addresses.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAddress(index)}
                        disabled={isSubmitting}
                        className="cursor-pointer shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAddress}
                disabled={isSubmitting}
                className="w-full cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Address
              </Button>
              <div className='flex flex-col gap-1'>
                <p className="text-center text-gray-400">OR</p>
              </div>
              <div className="flex flex-col">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full cursor-pointer flex items-center gap-2"
                  onClick={() => csvInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <Upload className="h-4 w-4" />
                  Upload CSV
                </Button>

                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleCsvUpload}
                />

                <p className="text-xs text-muted-foreground mt-1">
                  CSV must contain one column of addresses.
                </p>
              </div>

              {errors.addresses && (
                <p className="text-sm text-destructive">{errors.addresses}</p>
              )}
            </div>

          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{mode === "edit" ? "Update Group" : "Create Group"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

