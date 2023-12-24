export type Course = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    basePrice: number;
    isPublished: boolean;
    categories: Category[];
    mentor: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    chapters: Chapter[] | null;
};

export type Category = {
    _id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
};

export interface IAccount {
    accountId: string;
    displayName: string;
    email: string;
    password: string;
    phoneNumber: string;

    roles: ['user', 'admin', 'super_admin', 'mentor'];
    accountType: 'account' | 'facebook' | 'google';
    status: 'active' | 'banned';
    avatarUrl: string;
    coverImageUrl: string;
}

export interface Chapter {
    _id: string;
    slug: string;
    title: string;
    description?: string | null;
    videoUrl?: string | null;
    thumbnail: string;
    position: number;
    isPublished: boolean;
    isFree: boolean;
    course?: Course | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Attachment {
    id: string;
    filename: string;
    fileUrl: string;
    mimetype: string;
    filePath: string;
    type: 'image' | 'video' | 'audio' | 'document';
    size: number;

    uploader?: null;
    course?: Course | null;
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
    courses: require('./courses.json'),
    attachments: require('./attachment.json'),
    categories: require('./categories.json'),
    chapters: require('./chapter.json'),
    muxData: require('./mux-data.json'),
    purchases: require('./purchase.json'),
    stripeCustomers: require('./stripe-customer.json'),
    userProgresses: require('./user-progress.json'),
};

export default faker;
