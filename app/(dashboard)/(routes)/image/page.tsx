"use client";

import * as z from "zod";
import axios from "axios";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
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
import { useLooseModal } from "@/hooks/use-loose-modal";

import { amountOptions, formSchema, resolutionOptions } from "./constants";
import Pusher from "pusher-js";

const PhotoPage = () => {
  const proModal = useProModal();
  const looseModal = useLooseModal();
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [img, setImg] = useState<ImgResponse>();
  const [sendValues, setSendValues] = useState<SendValues>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      amount: "1",
      resolution: "512x512"
    }
  });

  type SendValues = {
    prompt: string, // must have
    amount: string, // must have
    resolution: string, // must have
  }

  type ImgResponse = {
    id: string, // must have
    status: string, // must have
    delayTime?: number,
    executionTime?: number,
    output?: { images:[], info: string, parameters: {}},
    images?:[],
  }

  const doSubmit = useCallback((values: SendValues) => {
    const fetchData = async () => {
      try {
        setPhotos([]);
        setIsLoading(true)
        const response = await axios.post('/api/image', values);
        const data = response.data
        if ( !(data) || !(data.status) || !(data.id) ) throw "Response Error";
        setImg(data)
        setIsSubscribed(true)
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
    fetchData()
  }, [proModal, router]);

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    const { prompt, amount, resolution } = values
    if (photos.length > 0 && !looseModal.confirm) {
      setSendValues( { prompt, amount, resolution } )
      looseModal.onOpen(); // ask before reset the images
      return
    } else {
      doSubmit( { prompt, amount, resolution } )
    }
  }, [doSubmit, looseModal, photos.length]);

  
  const handleFetchData = useCallback(() => { // will start image creation
    if (isLoading == false || img == undefined) return
    const fetchData = async () => {
      try {
        const response = await axios.post('/api/image/status', { id:img.id } );
        const data = response.data;
        if ( !(data) || !(data.status) || !(data.id) ) throw "Response Error";
        const { status } = data;
        if ((status == 'IN_QUEUE') || (status == 'IN_PROGRESS')) return
        if ((status == 'COMPLETED')) {
          const { images } = data;
          setPhotos(images);
          setIsLoading(false)
          setImg(undefined)
          setSendValues(undefined)
        }
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
    fetchData()
  }, [img, isLoading, proModal, router]);

  useEffect(() => { // Pusher subscribe
    if ( (img == undefined || img.status == 'COMPLETED') ) return
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe("chat");
    channel.bind(img.id, (data: any) => {
      if (img.status != 'COMPLETED') setImg(data)
      handleFetchData()
    });
    return () => {
        pusher.unsubscribe("chat");
        setIsSubscribed(false)
    };
  }, [img, handleFetchData]);

  const MINUTE_MS = 10000;  // Time loop to fetch while loading
  useEffect(() => {
    if ((img == undefined) || img.status == 'COMPLETED' ) return
    const interval = setInterval(() => { handleFetchData() }, MINUTE_MS);
    return () => { clearInterval(interval) }; // Unmount function, to prevent memory leaks.
  }, [img, handleFetchData])

  useEffect(() => {
    if ( (looseModal.confirm == true) && (sendValues != undefined) ) {
      looseModal.confirm = false;
      doSubmit(sendValues)
    }
  }, [looseModal, sendValues, doSubmit])

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
