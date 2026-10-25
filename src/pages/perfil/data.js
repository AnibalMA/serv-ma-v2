import { useUserStore } from "src/stores/user";
import { profileFormFromUser } from "./helpers";

export default function () {
  return {
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
