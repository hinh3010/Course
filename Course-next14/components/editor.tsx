'use client';

import dynamic from 'next/dynamic';
import { forwardRef, ForwardRefRenderFunction, useMemo, useImperativeHandle, Ref } from 'react';
import 'react-quill/dist/quill.snow.css';

interface EditorProps {
    onChange: (value: string) => void;
    value: string;
}

const EditorQuill: ForwardRefRenderFunction<unknown, EditorProps> = ({ onChange, value }: EditorProps, ref: Ref<unknown>) => {
    const ReactQuillComponent = useMemo(() => dynamic(() => import('react-quill').then((mod) => mod.default), { ssr: false }), []);

    useImperativeHandle(ref, () => ({
        getValue: () => value,
        setValue: (newValue: string) => {
            onChange(newValue);
        },
    }));

    return (
        <div className="bg-white">
            <ReactQuillComponent theme="snow" value={value} onChange={onChange} />
        </div>
    );
};

export const Editor = forwardRef(EditorQuill);
