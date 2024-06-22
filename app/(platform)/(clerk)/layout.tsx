const AuthenticationPageLayout = ({
	children,
}: {
	children: React.ReactNode
}) => {
	return (
		<main className="h-full flex items-center justify-center bg-slate-100">
			{children}
		</main>
	)
}

export default AuthenticationPageLayout
