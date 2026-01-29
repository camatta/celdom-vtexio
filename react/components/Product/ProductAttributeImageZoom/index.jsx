import React from "react";

import { useProduct } from 'vtex.product-context';

import style from "./product-attribute-image-zoom.css";

const ProductAttributeImageZoom = () => {
    const { selectedItem } = useProduct();
    const currentImg = document.querySelector(".vtex-store-components-3-x-productImagesGallerySlide.swiper-slide-active .vtex-store-components-3-x-productImageTag--pdp--main");
    const imgUrl = currentImg.src.split("&")[0];
    const imageId = imgUrl.match(/\/ids\/(\d+)/)?.[1]; // "pega o ID da imagem"
    const arrayImages = selectedItem.images;
    const imgObj = arrayImages.find(img => img.imageId === imageId || img.cacheId === imageId);
    // const textNormalized = imgObj.imageLabel.includes("-") ? imgObj.imageLabel.replaceAll("-", " ") : imgObj.imageLabel;

    return <div className={style.textAttribute}>{ imgObj.imageLabel }</div>;
}

export default ProductAttributeImageZoom;