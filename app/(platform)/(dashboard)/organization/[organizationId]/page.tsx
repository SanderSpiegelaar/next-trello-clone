import { create } from "@/actions/create-board"
import { deleteBoard } from "@/actions/delete-board"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"

const OrganizationIdPage = async () => {
	const boards = await db.board.findMany()

	return (
		<div className="flex flex-col space-y-4">
			<form action={create}>
				<input
					id="title"
					name="title"
					placeholder="Enter a board title"
					className="border-black border p-1"
				/>
				<Button type="submit">Submit</Button>
			</form>
			<div className="space-y-2">
				{boards.map((board) => (
					<div key={board.id}>
						Board title: {board.title}
						<form action={deleteBoard.bind(null, board.id)}>
							<button type="submit">Delete</button>
						</form>
					</div>
				))}
			</div>
		</div>
	)
}

export default OrganizationIdPage
