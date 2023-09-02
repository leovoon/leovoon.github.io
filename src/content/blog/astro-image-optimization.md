---
title: "How to optimize images in Astro 3.0"
description: "How to optimize images in Astro 3.0 and responsive images solution"
pubDate: "Sep 02 2023"
tags: ["astro", "framework"]
---

Astro 3.0 has just been released, and one of its standout features is the new image optimization capability. 

With Astro 3.0, you now have two powerful tools for optimizing images:

**1. Astro's Image Component:**
The first tool Astro provides is the Image Component. You can use this component in the body of your document, and it operates similarly to an HTML image tag. 

Here's how to use it:

## Astro will not optimize images in the `public` directory by default
- Ensure your image is located within the source directory, you can put them in `assets` folder
- Import the image into your Astro file.
- Replace the regular image tag with the Astro Image Component.
- Customize attributes like format, quality, and more for further optimization.

For example:
```js
---
import {Image} from 'astro:assets';
import imageFromAssets from './assets/image.jpg';
---

<Image src={imageFromAssets} alt="Image from assets" format="avif" width={300} height={300} />

```

That's it! it works the same way for remote images as well.

**2. The `getImage` Function:**
The second tool Astro offers is the `getImage` function. This function can be utilized in server-side code, either in the front matter of an Astro file or in JavaScript or TypeScript files. It works similarly to the Image Component but allows for more control and flexibility.

Here's a quick overview:
- Pass the source, format, and other attributes to the `getImage` function.
- It returns an object with various properties, including the optimized image source.
- You can use this function to customize the image rendering further, such as setting it as a background image.

For example:
```js
---
import { getImage } from 'astro:assets'
import imageFromAssets from './assets/image.jpg'

const { src } = await getImage({ src: imageFromAssets, format: 'avif' })

---

<main style={`background-image: url(${src})`}>
</main>
```

**Responsive Images:**
While Astro's Image Component and `getImage` function are fantastic for optimizing images, it's worth noting that they lack built-in support for responsive images. However, you can still create responsive images by crafting your own solution:

```js
---
import type { ImageOutputFormat } from "astro";
import { getImage } from "astro:assets";

type Props = {
  src: ImageMetadata;
  alt: string;
  format?: ImageOutputFormat;
  sizes: number[];
  class?: string;
};

async function generateResponsiveImage({
  src,
  format,
  sizes,
}: Omit<Props, "alt">) {
  const imgSrcSet = sizes.map(async (size) => {
    const image = await getImage({ src, width: size, format });
    return `${image.src} ${size}w`;
  });

  const imgSrc = await getImage({ src, width: Math.max(...sizes), format });

  return {
    srcSet: await Promise.all(imgSrcSet),
    imgSrc: imgSrc.src,
  };
}

const { src, sizes, format, alt, class: className } = Astro.props;

const { srcSet, imgSrc } = await generateResponsiveImage({
  src,
  sizes,
  format,
});
---

<img srcset={srcSet.join(", ")} alt={alt} src={imgSrc} class:list={className} />

```


That's it! You can now optimize your images with Astro 3.0.
Check out the [Astro docs](https://docs.astro.build/en/guides/images/) for more information on image optimization.

I came across this video on Youtube that explains well on this topic. Check it out: [Optimize Image Features in Astro 3.0 by Coding in Public](https://www.youtube.com/watch?v=vekQmqRXeDg) 

Happy coding!
