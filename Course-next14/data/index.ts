export type Course = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    basePrice: number;
    isPublished: boolean;
    categories: string[];
    mentor: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export type Category = {
    _id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
};

export interface Attachment {
    id: string;
    name: string;
    url: string;
    courseId: string;
    course?: Course | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Chapter {
    id: string;
    title: string;
    description?: string | null;
    videoUrl?: string | null;
    position: number;
    isPublished: boolean;
    isFree: boolean;
    muxData?: MuxData | null;
    courseId: string;
    course?: Course | null;
    userProgress?: UserProgress[];
    createdAt: Date;
    updatedAt: Date;
}

export interface MuxData {
    id: string;
    assetId: string;
    playbackId?: string | null;
    chapterId: string;
    chapter?: Chapter | null;
}

export interface UserProgress {
    id: string;
    userId: string;
    chapterId: string;
    chapter?: Chapter | null;
    isCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Purchase {
    id: string;
    userId: string;
    courseId: string;
    course?: Course | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface StripeCustomer {
    id: string;
    userId: string;
    stripeCustomerId: string;
    createdAt: Date;
    updatedAt: Date;
}

type FakerData = {
    courses: Course[];
    attachments: Attachment[];
    categories: Category[];
    chapters: Chapter[];
    muxData: MuxData[];
    purchases: Purchase[];
    stripeCustomers: StripeCustomer[];
    userProgresses: UserProgress[];
};

const faker: FakerData = {
    courses: require("./courses.json"),
    attachments: require("./attachment.json"),
    categories: require("./categories.json"),
    chapters: require("./chapter.json"),
    muxData: require("./mux-data.json"),
    purchases: require("./purchase.json"),
    stripeCustomers: require("./stripe-customer.json"),
    userProgresses: require("./user-progress.json"),
};

export default faker;
