import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Alert from '@blazejkustra/react-native-alert';
import api from '@/config/api';
import axios from 'axios';

export function ForgotPasswordForm() {
  const router = useRouter()

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit() {
    setSending(true)

    await api.post('/auth/forget-password', {"email": email})
    .then(async function () {
        Alert.alert("Reset password email sent.", "", [{text: "OK", onPress: () => {router.navigate("/sign-in")}}])
        setSending(false)
    })
    .catch(function (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert(error.response?.data.error)
      }
      setSending(false)
    })
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Forgot password?</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Enter your email to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="user@example.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                returnKeyType="send"
                onSubmitEditing={onSubmit}
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <Button className="w-full" onPress={onSubmit} disabled={!email || sending}>
              <Text>Reset your password</Text>
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
        </CardContent>
      </Card>
    </View>
  );
}
