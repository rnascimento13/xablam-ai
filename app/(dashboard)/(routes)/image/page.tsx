"use client";

import * as z from "zod";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Loader } from "@/components/loader";
import { Empty } from "@/components/ui/empty";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProModal } from "@/hooks/use-pro-modal";

import { amountOptions, formSchema, resolutionOptions } from "./constants";
import Pusher from "pusher-js";

const PhotoPage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  // const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [subscribe, setSubscribe] = useState<boolean>(false);
  const [imgId, setimgId] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      amount: "1",
      resolution: "512x512"
    }
  });

  // const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setPhotos([]);
      setIsLoading(true)
      const response = await axios.post('/api/image', values);
      const status = await response.data.status;
      if (!(status == 'IN_QUEUE')) throw "Not in queue";
      setimgId(await response.data.id)
      setSubscribe(true)
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      router.refresh();
    }
  }
  
  
  useEffect(() => {
    if (imgId == '') return
    // Pusher subscribe
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // console.log('subscribed: ', subscribe)
    const channel = pusher.subscribe("chat");
    setSubscribe(true)
    channel.bind("chat-event", (data: any) => {
      // setNotifications(data);
      // console.log('subscribed data found')

      const fetchData = async () => {
        try {
          const response = await axios.post('/api/image/status', data);
          // TODO: error on wrong response

          const images = await response.data.images;
          setPhotos(images);
          setIsLoading(false)
          setimgId('')
          // console.log('images returned: ', images.length, subscribe)
        } catch (error: any) {
          if (error?.response?.status === 403) {
            proModal.onOpen();
          } else {
            toast.error("Something went wrong.");
          }
        } finally {
          router.refresh();

          // console.log('trying to unsubscribe: ', subscribe)
          // if (subscribe == true) {
          //   pusher.unsubscribe("chat");
          //   console.log('unsubscribed')
          //   setSubscribe(false)
          // }
    
        }
      }
      fetchData()
    });
    return () => {
      // console.log('trying to unsubscribe: ', subscribe)
      if (subscribe == true) {
        pusher.unsubscribe("chat");
        // console.log('unsubscribed')
        setSubscribe(false)
      }

    };
  }, [imgId, proModal, router, subscribe]);

  return ( 
    <div>
      <Heading
        title="Image Generation"
        description="Turn your prompt into an image."
        icon={ImageIcon}
        iconColor="text-pink-700"
        bgColor="bg-pink-700/10"
      />
      <div className="px-4 lg:px-8">
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="
              rounded-lg 
              border 
              w-full 
              p-4 
              px-3 
              md:px-6 
              focus-within:shadow-sm
              grid
              grid-cols-12
              gap-2
            "
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-6">
                  <FormControl className="m-0 p-0">
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading} 
                      placeholder="A picture of a horse in Swiss alps" 
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-2">
                  <Select 
                    disabled={isLoading} 
                    onValueChange={field.onChange} 
                    value={field.value} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {amountOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resolution"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-2">
                  <Select 
                    disabled={isLoading} 
                    onValueChange={field.onChange} 
                    value={field.value} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {resolutionOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button className="col-span-12 lg:col-span-2 w-full" type="submit" disabled={isLoading} size="icon">
              Generate
            </Button>
          </form>
        </Form>
        {isLoading && (
          <div className="p-20">
            <Loader />
          </div>
        )}
        {photos.length === 0 && !isLoading && (
          <Empty label="No images generated." />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
          {photos.map((src) => (
            <Card key={src} className="rounded-lg overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  fill
                  alt="Generated"
                  src={src}
                />
              </div>
              <CardFooter className="p-2">
                <Button onClick={() => window.open(src)} variant="secondary" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
   );
}
 
export default PhotoPage;
