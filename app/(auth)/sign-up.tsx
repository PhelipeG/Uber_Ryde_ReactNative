import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  View,
  Image,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { ReactNativeModal } from "react-native-modal";
import { fetchAPI } from "@/lib/fetch";

export default function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });
  async function handleSignUpPress() {
    if (!isLoaded) return;
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].longMessage);
    }
  }
  async function handlePressVerify() {
    if (!isLoaded) {
      return;
    }
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      if (completeSignUp.status === "complete") {
        await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: completeSignUp.createdUserId,
          }),
        });
        await setActive({ session: completeSignUp.createdSessionId });
        setVerification({
          ...verification,
          state: "success",
        });
      } else {
        setVerification({
          ...verification,
          error: "Verification failed. Please try again.",
          state: "failed",
        });
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      setVerification({
        ...verification,
        error: err.errors[0].longMessage,
        state: "failed",
      });
      console.error(JSON.stringify(err, null, 2));
    }
  }
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Comportamento para iOS e Android
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // Ajuste para Android
    >
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 bg-white">
          <View className="relative w-full h-[250px]">
            <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
            <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
              Criar sua conta
            </Text>
          </View>
          <ScrollView className="p-5">
            <InputField
              label="Nome"
              placeholder="Digite seu nome"
              icon={icons.person}
              value={form.name}
              onChangeText={(value) => setForm({ ...form, name: value })}
            />
            <InputField
              label="Email"
              placeholder="Digite seu email"
              icon={icons.email}
              textContentType="emailAddress"
              value={form.email}
              onChangeText={(value) => setForm({ ...form, email: value })}
            />
            <InputField
              label="Senha"
              placeholder="Crie sua senha"
              icon={icons.lock}
              secureTextEntry={true}
              textContentType="password"
              value={form.password}
              onChangeText={(value) => setForm({ ...form, password: value })}
            />
            <CustomButton
              title="Sign Up"
              className="mt-6"
              onPress={handleSignUpPress}
            />
            <OAuth />
            <Link
              href="/sign-in"
              className="text-lg text-center text-general-200 mt-10"
            >
              Voce ja tem uma conta?{" "}
              <Text className="text-primary-500">Entre Aqui</Text>
            </Link>
          </ScrollView>
          <ReactNativeModal
            isVisible={verification.state === "pending"}
            onModalHide={() => {
              if (verification.state === "success") {
                setShowSuccessModal(true);
              }
            }}
          >
            <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
              <Text className="font-JakartaExtraBold text-2xl mb-2">
                Verificaçao de Codigo
              </Text>
              <Text className="font-Jakarta mb-5">
                Codigo Enviado para este email: {form.email}.
              </Text>
              <InputField
                label={"Code"}
                icon={icons.lock}
                placeholder={"12345"}
                value={verification.code}
                keyboardType="numeric"
                onChangeText={(code) =>
                  setVerification({ ...verification, code })
                }
              />
              {verification.error && (
                <Text className="text-red-500 text-sm mt-1">
                  {verification.error}
                </Text>
              )}
              <CustomButton
                title="Verificar Email"
                onPress={handlePressVerify}
                className="mt-5 bg-success-500"
              />
            </View>
          </ReactNativeModal>
          <ReactNativeModal isVisible={showSuccessModal}>
            <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
              <Image
                source={images.check}
                className="w-[110px] h-[110px] mx-auto my-5"
              />
              <Text className="text-3xl font-JakartaBold text-center">
                Verificado com sucesso
              </Text>
              <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
                Parabens voce verificou a conta
              </Text>
              <CustomButton
                title="Ir para tela inicial"
                onPress={() => router.push(`/(root)/(tabs)/home`)}
                className="mt-5"
              />
            </View>
          </ReactNativeModal>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
