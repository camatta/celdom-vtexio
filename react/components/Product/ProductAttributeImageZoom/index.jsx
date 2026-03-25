import React from "react";

import { useProduct } from 'vtex.product-context';

import style from "./product-attribute-image-zoom.css";

const resolveImageDisplayText = (imgObj) => {
    const imageLabel = imgObj?.imageLabel?.trim() || "";
    const imageText = imgObj?.imageText?.trim() || "";
    const isNumeric = (value) => /^\d+$/.test(value);

    if (isNumeric(imageLabel)) return imageLabel;
    if (isNumeric(imageText)) return imageText;

    return imageLabel || imageText || null;
};

const ProductAttributeImageZoom = () => {
    const { selectedItem } = useProduct();
    const currentImg = document.querySelector(".vtex-store-components-3-x-productImagesGallerySlide.swiper-slide-active .vtex-store-components-3-x-productImageTag--pdp--main");
    const imgUrl = currentImg.src.split("&")[0];
    const imageId = imgUrl.match(/\/ids\/(\d+)/)?.[1]; // "pega o ID da imagem"
    const arrayImages = selectedItem.images;
    const imgObj = arrayImages.find(img => img.imageId === imageId || img.cacheId === imageId);
    // const textNormalized = resolveImageDisplayText(imgObj)?.includes("-") ? resolveImageDisplayText(imgObj).replaceAll("-", " ") : resolveImageDisplayText(imgObj);

    return <div className={style.textAttribute}>{ resolveImageDisplayText(imgObj) }</div>;
}

export default ProductAttributeImageZoom;
