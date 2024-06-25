"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { DragDropContext, Droppable } from "@hello-pangea/dnd"

import { ListWithCards } from "@/types"
import { useAction } from "@/hooks/use-action"
import { updateListOrder } from "@/actions/update-list-order"
import { updateCardOrder } from "@/actions/update-card-order"

import { ListForm } from "./list-form"
import { ListItem } from "./list-item"

interface ListContainerProps {
	data: ListWithCards[]
	boardId: string
}

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
	const result = Array.from(list)
	const [removed] = result.splice(startIndex, 1)
	result.splice(endIndex, 0, removed)

	return result
}

export const ListContainer = ({ data, boardId }: ListContainerProps) => {
	const [orderedData, setOrderedData] = useState(data)

	const { execute: executeUpdateListOrder } = useAction(updateListOrder, {
		onSuccess: () => {
			toast.success("List reordered")
		},
		onError: (error) => {
			toast.error(error)
		},
	})

	const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
		onSuccess: () => {
			toast.success("Card reordered")
		},
		onError: (error) => {
			toast.error(error)
		},
	})

	useEffect(() => {
		setOrderedData(data)
	}, [data])

	const onDragEnd = (result: any) => {
		const { destination, source, type } = result

		if (!destination) return

		// if dropped in the same position
		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		) {
			return
		}

		// user moves list
		if (type === "list") {
			const items = reorder(orderedData, source.index, destination.index).map(
				(item, index) => ({ ...item, order: index })
			)

			setOrderedData(items)
			executeUpdateListOrder({ items, boardId })
		}

		// user moves card
		if (type === "card") {
			let newOrderedData = [...orderedData]

			// Source and destination list
			const sourceList = newOrderedData.find(
				(list) => list.id === source.droppableId
			)
			const destinationList = newOrderedData.find(
				(list) => list.id === destination.droppableId
			)

			if (!sourceList || !destinationList) return

			// check if cards exist on sourceList
			if (!sourceList.cards) {
				sourceList.cards = []
			}

			// check if cards exist on destinationList
			if (!destinationList.cards) {
				destinationList.cards = []
			}

			// moving the card in the same list
			if (source.droppableId === destination.droppableId) {
				const reorderedCards = reorder(
					sourceList.cards,
					source.index,
					destination.index
				)
				reorderedCards.forEach((card, index) => {
					card.order = index
				})

				sourceList.cards = reorderedCards

				setOrderedData(newOrderedData)
				executeUpdateCardOrder({ boardId: boardId, items: reorderedCards })
			} else {
				// user moves card to different list
				const [movedCard] = sourceList.cards.splice(source.index, 1)

				// Assign new listId to the moved card
				movedCard.listId = destination.droppableId
				// add card to destination list
				destinationList.cards.splice(destination.index, 0, movedCard)

				sourceList.cards.forEach((card, index) => {
					card.order = index
				})

				// update the order for each card in destination list
				destinationList.cards.forEach((card, index) => {
					card.order = index
				})

				setOrderedData(newOrderedData)
				// TODO trigger server action
				executeUpdateCardOrder({
					boardId: boardId,
					items: destinationList.cards,
				})
			}
		}
	}

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable
				droppableId="lists"
				type="list"
				direction="horizontal"
			>
				{(provided) => (
					<ol
						{...provided.droppableProps}
						ref={provided.innerRef}
						className="flex gap-x-3 h-full"
					>
						{orderedData.map((list, index) => {
							return (
								<ListItem
									key={list.id}
									index={index}
									data={list}
								/>
							)
						})}
						{provided.placeholder}
						<ListForm />
						<div className="flex shrink-0 w-1" />
					</ol>
				)}
			</Droppable>
		</DragDropContext>
	)
}
