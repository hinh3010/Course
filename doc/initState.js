const initState = {
    variants: [
        {
            "base_cost": 11.75,
            "_id": "658be97099b06c5a7c5e58f2",
            "product": "658be96e99b06c79ee5e5731",
            "mockup": "63a27f8dabb4ee499b716c1c",
            "attributes": [
                {
                    "name": "label",
                    "type": "label",
                    "value_text": "Youth",
                    "value_code": "youth"
                },
                {
                    "name": "color",
                    "type": "color",
                    "value_text": "Antique cherry red",
                    "value_code": "antiquecherryred"
                },
                {
                    "name": "size",
                    "type": "size",
                    "value_text": "XS",
                    "value_code": "xs"
                }
            ],
            mockup: {
                "default_material_color": "#ffffff" ?? "",
                "minimum_dpi": 72,
                "size": {
                    "width": 12000,
                    "height": 6000,
                },
                "sides": {
                    "back": {
                        "template_url": "https://platform126.s3.us-west-1.amazonaws.com/product-mockups-v2/preview/28-05-23/sweater_3d/back.png",
                        "position": {
                            "top": 2173,
                            "left": 6111
                        },
                        "size": {
                            "width": 3140,
                            "height": 2968
                        },
                        background: {}
                    },
                    "front": {
                        "template_url": "https://platform126.s3.us-west-1.amazonaws.com/product-mockups-v2/preview/28-05-23/sweater_3d/front.png",
                        "position": {
                            "top": 2164,
                            "left": 2734
                        },
                        "size": {
                            "width": 3132,
                            "height": 2986
                        }
                    },
                    "hem_front": {
                        "template_url": "https://platform126.s3.us-west-1.amazonaws.com/product-mockups-v2/preview/28-05-23/sweater_3d/hem-1.png",
                        "position": {
                            "top": 4937,
                            "left": 2747
                        },
                        "size": {
                            "width": 3110,
                            "height": 546
                        }
                    },
                    "hem_back": {
                        "template_url": "https://platform126.s3.us-west-1.amazonaws.com/product-mockups-v2/preview/28-05-23/sweater_3d/hem-2.png",
                        "position": {
                            "top": 4937,
                            "left": 6111
                        },
                        "size": {
                            "width": 3137,
                            "height": 546
                        }
                    },
                    "sleeve_right": {
                        "template_url": "https://platform126.s3.us-west-1.amazonaws.com/product-mockups-v2/preview/28-05-23/sweater_3d/sleeve-1.png",
                        "position": {
                            "top": 2666,
                            "left": 45
                        },
                        "size": {
                            "width": 2555,
                            "height": 2499
                        }
                    },
                    "sleeve_left": {
                        "template_url": "https://platform126.s3.us-west-1.amazonaws.com/product-mockups-v2/preview/28-05-23/sweater_3d/sleeve-2.png",
                        "position": {
                            "top": 2989,
                            "left": 9629
                        },
                        "size": {
                            "width": 2073,
                            "height": 2157
                        }
                    },
                    "cuff_right": {
                        "template_url": "https://platform126.s3.us-west-1.amazonaws.com/product-mockups-v2/preview/28-05-23/sweater_3d/cuff-1.png",
                        "position": {
                            "top": 4931,
                            "left": 643
                        },
                        "size": {
                            "width": 1360,
                            "height": 550
                        }
                    },
                    "cuff_left": {
                        "template_url": "https://platform126.s3.us-west-1.amazonaws.com/product-mockups-v2/preview/28-05-23/sweater_3d/cuff-2.png",
                        "position": {
                            "top": 4931,
                            "left": 9993
                        },
                        "size": {
                            "width": 1360,
                            "height": 550
                        }
                    },
                    "neck_front": {
                        "template_url": "https://platform126.s3.us-west-1.amazonaws.com/product-mockups-v2/preview/28-05-23/sweater_3d/neck-1.png",
                        "position": {
                            "top": 1910,
                            "left": 3651
                        },
                        "size": {
                            "width": 1314,
                            "height": 256
                        }
                    },
                    "neck_back": {
                        "template_url": "https://platform126.s3.us-west-1.amazonaws.com/product-mockups-v2/preview/28-05-23/sweater_3d/neck-2.png",
                        "position": {
                            "top": 1910,
                            "left": 7303
                        },
                        "size": {
                            "width": 772,
                            "height": 296
                        }
                    }
                },
            },
        },
    ],

    activeVariant: '658be97099b06c5a7c5e58f1',
    activeSide: '',
    selectedLayer: null,
    isCapture: false,
    isPublish: false,

    width: 0,
    height: 0,
    drag: false,
    ref: null,

    container: {
        width: 0,
        height: 0,
        ref: null,
    },

    designs: [
        {
            linked_variants: ['658be97099b06c5a7c5e58f1', '658be97099b06c5a7c5e58f2'],
            layer: {
                'front': [],
                'back': []
            },
            isDefault: true,
        },
        {
            linked_variants: ['658be97099b06c5a7c5e58f3'],
            layer: {
                'front': [],
                'back': []
            },
        },
    ]
}