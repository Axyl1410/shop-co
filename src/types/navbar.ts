export type MenuItem = {
	id: number
	type: 'MenuItem' | 'MenuList'
	label: string
	url: string
	children:
		| (Omit<MenuItem, 'children' | 'type'> & {
				description?: string
		  })[]
		| []
}

export type MenuListData = (Omit<MenuItem, 'children' | 'type'> & {
	description?: string
})[]

export type NavMenu = MenuItem[]
