import fs from 'fs'
import latex from 'node-latex'

const server = Bun.serve({
    port: 3000,
    async fetch(_) {
        const input = fs.createReadStream('../Mala-ay - CV.tex')
        const output = fs.createWriteStream('output.pdf')
        const pdf = latex(input)

        pdf.pipe(output)
        await new Promise((resolve, reject) => {
            pdf.on('finish', resolve)
            pdf.on('error', reject)
        })

        const file = await Bun.file('output.pdf').arrayBuffer()

        return new Response(file, {
                headers: {
                    'Content-Type': 'application/pdf'
                }
            }
        )
    }
})

console.log(`Server running on http://localhost:${server.port}`)