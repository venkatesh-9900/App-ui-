import {useEffect, useRef, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Label} from "@/components/ui/label";
import {useToast} from "@/hooks/use-toast";
import {Camera, Loader2, User, X} from "lucide-react";
import {getUserProfile, updateUserProfile} from "@/hooks/user-service.ts";
import {AppUserProfile} from "@/types";
import {uploadProfileImageToServer} from "@/hooks/upload-file.ts";


export default function ProfilePage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    imageUrl: ""
  });
  const [originalData, setOriginalData] = useState(formData);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch current profile
  useEffect(() => {
    const loadProfile = () => {
      setLoadingProfile(true);
      
      const successTask = (data: AppUserProfile) => {
        const profileData = {
          displayName: data.displayName || '',
          bio: data.bio || '',
          imageUrl: data.imageUrl || '',
        };
        setProfile(data);
        setFormData(profileData);
        setOriginalData(profileData);
        setLoadingProfile(false);
      };

      const failureTask = () => {
        toast({
          title: "Error",
          description: "Failed to load profile.",
          variant: "destructive",
        });
        setLoadingProfile(false);
      };

      const errorTask = () => {
        toast({
          title: "Error",
          description: "Failed to load profile.",
          variant: "destructive",
        });
        setLoadingProfile(false);
      };

      getUserProfile({
        successTask,
        failureTask,
        errorTask,
        retry: false
      });
    };

    loadProfile();
  }, [toast]);

  // Check if form has changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  // Character limits
  const limits = {
    username: 30,
    displayName: 100,
    bio: 500
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await updateUserProfile({
        displayName: formData.displayName,
        bio: formData.bio
      });

      setOriginalData(formData);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData(originalData);
    setImagePreview(null);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }
    // Create preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      try {
        const { imageUrl } = await uploadProfileImageToServer(file);

        setFormData((prev) => ({
          ...prev,
          imageUrl,
          profileImageUrl: result,
        }));

        toast({
          title: "Success",
          description: "Profile image uploaded.",
        });
      } catch (err) {
        console.error("Profile image upload failed", err);
        toast({
          title: "Upload Failed",
          description: "Unable to upload profile image.",
          variant: "destructive",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  if (loadingProfile) {
    return (
        <div className="content-section">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>
    );
  }

  return (
      <div className="content-section max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <User className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
          </div>
          <p className="text-slate-600">
            Manage your account profile and personal information.
          </p>
          {profile?.updatedAt && (
              <p className="text-sm text-slate-500 mt-1">
                Last updated on {new Date(profile.updatedAt).toLocaleDateString()}
              </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={imagePreview || formData.imageUrl || undefined} />
                  <AvatarFallback className="text-lg">
                    {formData.displayName
                        ? formData.displayName.charAt(0).toUpperCase()
                        : ""
                    }
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Upload Photo
                  </Button>
                  <p className="text-sm text-slate-500">
                    JPG, PNG up to 5MB
                  </p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Enter display name"
                    maxLength={limits.displayName}
                />
                <div className="flex justify-end text-sm text-slate-500">
                  {formData.displayName.length}/{limits.displayName}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    maxLength={limits.bio}
                    rows={4}
                    className="resize-none"
                />
                <div className="flex justify-end text-sm text-slate-500">
                  {formData.bio.length}/{limits.bio}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={!hasChanges || isUpdating}
            >
              Cancel
            </Button>
            <Button
                type="submit"
                disabled={!hasChanges || isUpdating }
                className="flex items-center gap-2"
            >
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
  );
}