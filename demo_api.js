return Application({
    title: "Calc App",
    width: 300,
    height: 400,
    child: Grid({
        rows: 9,
        columns: 4,
        cellWidth: 50,
        style: { padding: "10px", backgroundColor: "blue", hover: { backgroundColor: "darkblue" } },
        tw: "grid grid-cols-4 gap-2 hover:bg-darkblue"
    },
        GridCell({
            row: 0,
            column: 0,
            columnSpan: 4,
            child: TextBox({
                width: 200,
                height: 40,
                fontSize: 24,
                textAlign: "right",
                readOnly: true,
                value: "0"
            })
        }),
        ...(Array.from({ length: 8 }, (_, i) => (
            GridCell({
                row: Math.floor((i + 1) / 4),
                column: (i + 1) % 4,
                child: Button({

                })
            })
        )))
    )
})