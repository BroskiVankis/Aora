import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "./../../components/FormField";
import WebView from "react-native-webview";
import * as ImagePicker from "expo-image-picker";
import { icons } from "../../constants";
import CustomButton from "./../../components/CustomButton";
import { uploadVideoToCloudinary } from "../../lib/cloudinary"; // 👈 your upload logic
import { ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { createVideo } from "../../lib/appwrite"; // 👈 your upload logic
import { useGlobalContext } from './../../context/GlobalProvider';

const CLOUD_NAME = "dykvovsis";
const UPLOAD_PRESET = "unsigned_video";

const Create = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    video: null,
    thumbnail: null,
    prompt: "",
  });
  const [videoUrl, setVideoUrl] = useState(null); // for WebView preview

  const openPicker = async (selectType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: selectType === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const file = result.assets?.[0] ?? result;
      if (selectType === "image") {
        setForm({ ...form, thumbnail: file });
      } else if (selectType === "video") {
        setForm({ ...form, video: file });
        setVideoUrl(null); // Reset preview
      }
    }
  };

  const submit = async () => {
    try {
      setUploading(true);

      await createVideo({
        ...form, userId: user.$id
      })

      if (!form.video) {
        Alert.alert("Missing Video", "Please select a video to upload.");
        return;
      }

      const uploadedUrl = await uploadVideoToCloudinary(
        form.video.uri,
        UPLOAD_PRESET,
        CLOUD_NAME
      );

      setVideoUrl(uploadedUrl);

      Alert.alert("Upload Success", "Your video was uploaded!");
      router.push("/home");
    } catch (error) {
      Alert.alert("Upload Failed", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-white text-2xl font-psemibold">Upload Video</Text>

        <FormField
          title="Video Title"
          value={form.title}
          placeholder="Give your video a catchy title..."
          handleChangeText={(e) => setForm({ ...form, title: e })}
          otherStyles="mt-10"
        />

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Upload Video
          </Text>

          <TouchableOpacity onPress={() => openPicker("video")}>
            {uploading ? (
              <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center">
                <ActivityIndicator size="large" color="#fff" />
                <Text className="text-gray-100 mt-2">Uploading video...</Text>
              </View>
            ) : videoUrl ? (
              <View
                style={{
                  width: "100%",
                  height: 248,
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                <WebView
                  source={{ uri: videoUrl }}
                  style={{ flex: 1 }}
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                />
              </View>
            ) : form.video ? (
              <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center">
                <Text className="text-gray-100 text-sm text-center px-4">
                  Video selected: {form.video.name}
                </Text>
              </View>
            ) : (
              <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center">
                <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
                  <Image
                    source={icons.upload}
                    resizeMode="contain"
                    className="w-1/2 h-1/2"
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Thumbnail Image
          </Text>

          <TouchableOpacity onPress={() => openPicker("image")}>
            {form.thumbnail ? (
              <Image
                source={{ uri: form.thumbnail.uri }}
                className="w-full h-64 rounded-2xl"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-black-200 flex-row space-x-2">
                <Image
                  source={icons.upload}
                  resizeMode="contain"
                  className="w-5 h-5"
                />
                <Text className="text-sm text-gray-100 font-pmedium">
                  Choose a file
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FormField
          title="AI Prompt"
          value={form.prompt}
          placeholder="The prompt you used to create this video"
          handleChangeText={(e) => setForm({ ...form, prompt: e })}
          otherStyles="mt-7"
        />

        <CustomButton
          title="Submit & Publish"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create;
