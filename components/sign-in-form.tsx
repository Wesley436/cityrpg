// import { SocialConnections } from '@/components/social-connections';
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
// import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, type TextInput, View } from 'react-native';
import Alert from '@blazejkustra/react-native-alert';
import { useState, useEffect } from 'react';
import api from "../config/api";
import axios from "axios";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox } from './ui/checkbox';

const SignInForm = () => {
  const router = useRouter()

  const passwordInputRef = React.useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    const fetchValuesFormStorage = async () => {
        try {
            const emailValue = await AsyncStorage.getItem('email');
            const passwordValue = await AsyncStorage.getItem('password');
            const rememberMeValue = await AsyncStorage.getItem('rememberMe')
            if (emailValue) {
              setEmail(JSON.parse(emailValue))
            }
            if (passwordValue) {
              setPassword(JSON.parse(passwordValue))
            }
            if (rememberMeValue) {
              setRememberMe(JSON.parse(rememberMeValue))
            }
        } catch (error) {
            console.error('Error fetching remember me values:', error);
        }
    };
    fetchValuesFormStorage();
  }, []);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function login() {
    setLoggingIn(true)

    await api.post('/auth/login', {"email": email, "password": password})
    .then(async function (response) {
        await AsyncStorage.setItem('uid', JSON.stringify(response.headers["uid"]));
        await AsyncStorage.setItem('id_token', JSON.stringify(response.headers["id_token"]));
        await AsyncStorage.setItem('refresh_token', JSON.stringify(response.headers["refresh_token"]));

        if (rememberMe) {
          await AsyncStorage.setItem('email', JSON.stringify(email));
          await AsyncStorage.setItem('password', JSON.stringify(password));
          await AsyncStorage.setItem('rememberMe', JSON.stringify(rememberMe));
        } else {
          await AsyncStorage.removeItem('email');
          await AsyncStorage.removeItem('password');
          await AsyncStorage.removeItem('rememberMe');
        }

        router.navigate("/main/map")
        setLoggingIn(false)
    })
    .catch(function (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert(error.response?.data.error)
      }
      setLoggingIn(false)
    })
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Welcome to City RPG!</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Please login / register to continue
          </CardDescription>
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
                <Button
                  variant="link"
                  size="sm"
                  className="web:h-fit ml-auto h-4 px-1 py-0 sm:h-4"
                  onPress={() => {
                    router.navigate("/forget-password");
                  }}>
                  <Text className="font-normal leading-4">Forgot your password?</Text>
                </Button>
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                secureTextEntry
                returnKeyType="send"
                value={password}
                onChangeText={setPassword}
              />
            </View>
            <View className="flex flex-row items-start gap-3">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
              />
              <Label
                htmlFor="remember-me">
                Remember me
              </Label>
            </View>
            <Button className="w-full" onPress={login} disabled={!email || !password || loggingIn}>
              <Text>Login</Text>
            </Button>
            {/* <Button className="w-full" onPress={async () => {
                await api.get('/')
                .then(async function (response) {
                  console.log(response)
                })
            }}>
              <Text>Test refresh token</Text>
            </Button> */}
          </View>
          <Text className="text-center text-sm">
            Don&apos;t have an account?{' '}
            {/* <Pressable> */}
              <Text className="text-sm underline underline-offset-4" onPress={() => {
                router.navigate("/sign-up");
              }}>
                Register
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

export default SignInForm;