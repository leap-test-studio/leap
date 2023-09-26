function DisplayCard({ name, cardIcon, actions, children }) {
    return <div key={name} className="bg-slate-50 border border-slate-300 rounded-md shadow-md hover:shadow-lg transition duration-300 p-1">
        <div className="flex flex-row rounded-tr rounded-tl h-full">
            <div className="flex flex-col w-3/12 items-center justify-center">
                {cardIcon}
            </div>
            <div className="flex flex-col w-9/12 text-left pb-2">
                <div className="flex flex-col w-full">
                    {actions}
                </div>
                <div className="text-color-0700 text-base font-medium break-all pb-0.5 -mt-1">{name}</div>
                {children}
            </div>
        </div>
    </div>
}

export default DisplayCard;
