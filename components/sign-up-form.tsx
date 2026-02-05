// import { SocialConnections } from '@/components/social-connections';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Alert from '@blazejkustra/react-native-alert';
import api from "../config/api";
import axios from "axios";
import { useRouter } from "expo-router";

const SignUpForm = () => {
  const router = useRouter()

  const passwordInputRef = React.useRef<TextInput>(null);
  const confirmPasswordInputRef = React.useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registering, setRegistering] = useState(false);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  function onPasswordSubmitEditing() {
    confirmPasswordInputRef.current?.focus();
  }

  async function register() {
    setRegistering(true)

    await api.post('/auth/register', {"email": email, "password": password, "confirm_password": confirmPassword})
    .then(async function () {
        Alert.alert("Account created successfully.", "", [{text: "OK", onPress: () => {router.navigate("/sign-in")}}])
        setRegistering(false)
    })
    .catch(function (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert(error.response?.data.error)
      }
      setRegistering(false)
    })
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Create your account</CardTitle>
          {/* <CardDescription className="text-center sm:text-left">
            Welcome! Please fill in the details to get started.
          </CardDescription> */}
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="user@email.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                onSubmitEditing={onEmailSubmitEditing}
                returnKeyType="next"
                submitBehavior="submit"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Password</Label>
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                secureTextEntry
                returnKeyType="send"
                onSubmitEditing={onPasswordSubmitEditing}
                value={password}
                onChangeText={setPassword}
              />
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="confirm-password">Confirm Password</Label>
              </View>
              <Input
                ref={confirmPasswordInputRef}
                id="confirm-password"
                secureTextEntry
                returnKeyType="send"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              {
                (confirmPassword && password !== confirmPassword)
                ?
                <Text className="text-red-500">
                  The two passwords do not match.
                </Text>
                : null
              }
            </View>
            <Button className="w-full" onPress={register} disabled={!email || !password || !confirmPassword || (password !== confirmPassword) || registering}>
              <Text>Register</Text>
            </Button>
          </View>
          <Text className="text-center text-sm">
            Already have an account?{' '}
            {/* <Pressable> */}
              <Text className="text-sm underline underline-offset-4"
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.navigate("/sign-in")
                }
              }}>
                Sign in
              </Text>
            {/* </Pressable> */}
          </Text>
          {/* <View className="flex-row items-center">
            <Separator className="flex-1" />
            <Text className="text-muted-foreground px-4 text-sm">or</Text>
            <Separator className="flex-1" />
          </View>
          <SocialConnections /> */}
        </CardContent>
      </Card>
    </View>
  );
}

export default SignUpForm;