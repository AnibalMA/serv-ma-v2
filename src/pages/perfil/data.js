import { useUserStore } from "src/stores/user";
import { profileFormFromUser } from "./helpers";

export default function () {
  return {
    // Which avatar request is running: "preset", "photo", "reset" or ""
    avatarAction: "",
    showAvatarPicker: false,
    profileForm: profileFormFromUser(useUserStore().user),
    savingProfile: false,
    passwordForm: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    showCurrentPassword: false,
    showNewPassword: false,
    savingPassword: false,
    googleError: "",
  };
}
