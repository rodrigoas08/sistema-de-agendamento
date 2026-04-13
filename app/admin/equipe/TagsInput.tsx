"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagsInputProps {
	tags: string[];
	onChange: (tags: string[]) => void;
}

/**
 * TagsInput - Interactive tag input component
 *
 * Allows the user to add tags by typing and pressing Enter or comma,
 * and remove them by clicking the X button on each tag.
 *
 * @param {TagsInputProps} props - Component props
 * @returns The rendered tags input
 */
export default function TagsInput({ tags, onChange }: TagsInputProps) {
	const [inputValue, setInputValue] = useState("");

	const addTag = (rawTag: string) => {
		const trimmedTag = rawTag.trim().toLowerCase();
		if (trimmedTag && !tags.includes(trimmedTag)) {
			onChange([...tags, trimmedTag]);
		}
		setInputValue("");
	};

	const removeTag = (tagToRemove: string) => {
		onChange(tags.filter((tag) => tag !== tagToRemove));
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter" || event.key === ",") {
			event.preventDefault();
			addTag(inputValue);
		}

		if (event.key === "Backspace" && !inputValue && tags.length > 0) {
			removeTag(tags[tags.length - 1]);
		}
	};

	return (
		<div>
			<label
				htmlFor="tags-input"
				className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
			>
				Tags <span className="text-gray-400 normal-case font-medium">(opcional)</span>
			</label>
			<div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-red-500 transition-all min-h-[48px]">
				{tags.map((tag) => (
					<span
						key={tag}
						className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-700 animate-in fade-in zoom-in duration-150"
					>
						{tag}
						<button
							type="button"
							onClick={() => removeTag(tag)}
							className="p-0.5 rounded-full hover:bg-gray-300 transition-colors cursor-pointer"
							aria-label={`Remover tag ${tag}`}
						>
							<X size={12} />
						</button>
					</span>
				))}
				<input
					id="tags-input"
					type="text"
					value={inputValue}
					onChange={(event) => setInputValue(event.target.value)}
					onKeyDown={handleKeyDown}
					className="flex-1 min-w-[120px] outline-none text-sm placeholder:text-gray-400"
					placeholder={
						tags.length === 0 ? "Digite e pressione Enter..." : "Adicionar tag..."
					}
				/>
			</div>
			<p className="text-gray-400 text-[10px] mt-1.5 font-medium">
				Pressione Enter ou vírgula para adicionar
			</p>
		</div>
	);
}
