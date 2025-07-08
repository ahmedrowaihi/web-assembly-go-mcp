//go:build js && wasm

package main

import (
	"encoding/json"
	"fmt"
	"syscall/js"

	"github.com/invopop/jsonschema"
	mcp_golang "github.com/metoro-io/mcp-golang"
)

// Tool arguments are just structs, annotated with jsonschema tags
// More at https://mcpgolang.com/tools#schema-generation
type Content struct {
	Title       string  `json:"title" jsonschema:"required,description=The title to submit"`
	Description *string `json:"description" jsonschema:"description=The description to submit"`
}

type MyFunctionsArguments struct {
	Submitter string  `json:"submitter" jsonschema:"required,description=The name of the thing calling this tool (openai, google, claude, etc)"`
	Content   Content `json:"content" jsonschema:"required,description=The content of the message"`
}

type CalculateArguments struct {
	A int `json:"a"`
	B int `json:"b"`
}

type FetchDataArguments struct {
	URL string `json:"url"`
}

var server *mcp_golang.Server

func handleMCPRequest(this js.Value, args []js.Value) interface{} {
	req := args[0].String()
	var rpcReq struct {
		Method string          `json:"method"`
		Params json.RawMessage `json:"params"`
		ID     interface{}     `json:"id"`
	}
	err := json.Unmarshal([]byte(req), &rpcReq)
	if err != nil {
		return js.ValueOf(fmt.Sprintf(`{"error": "invalid request: %s"}`, err.Error()))
	}

	fmt.Println("Received method:", rpcReq.Method)

	var resp string
	switch rpcReq.Method {
	case "hello":
		var args MyFunctionsArguments
		if err := json.Unmarshal(rpcReq.Params, &args); err != nil {
			resp = fmt.Sprintf(`{"error": "invalid params: %s"}`, err.Error())
		} else {
			toolResp := mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Hello, %s!", args.Submitter)))
			out, _ := json.Marshal(toolResp)
			resp = string(out)
		}
		return js.ValueOf(resp)
	case "calculate":
		var args CalculateArguments
		if err := json.Unmarshal(rpcReq.Params, &args); err != nil {
			resp = fmt.Sprintf(`{"error": "invalid params: %s"}`, err.Error())
		} else {
			toolResp := mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("A + B is %d", args.A+args.B)))
			out, _ := json.Marshal(toolResp)
			resp = string(out)
		}
		return js.ValueOf(resp)
	case "fetch_data":
		var args FetchDataArguments
		if err := json.Unmarshal(rpcReq.Params, &args); err != nil {
			resp = fmt.Sprintf(`{"error": "invalid params: %s"}`, err.Error())
			return js.ValueOf(resp)
		}
		fetch := js.Global().Get("fetch")
		if !fetch.Truthy() {
			toolResp := mcp_golang.NewToolResponse(mcp_golang.NewTextContent("fetch API not available"))
			out, _ := json.Marshal(toolResp)
			resp = string(out)
			return js.ValueOf(resp)
		}
		promiseConstructor := js.Global().Get("Promise")
		promise := promiseConstructor.New(js.FuncOf(func(_ js.Value, argsJs []js.Value) interface{} {
			resolve := argsJs[0]
			// reject := argsJs[1] // not used here
			fetch.Invoke(args.URL).Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				respJs := args[0]
				respJs.Call("text").Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
					toolResp := mcp_golang.NewToolResponse(mcp_golang.NewTextContent(args[0].String()))
					out, _ := json.Marshal(toolResp)
					resolve.Invoke(string(out))
					return nil
				}))
				return nil
			}))
			return nil
		}))
		return promise
	default:
		resp = `{"error": "unknown method"}`
		return js.ValueOf(resp)
	}
}

func main() {
	server = mcp_golang.NewServer(nil)
	jsonschema.Version = "https://json-schema.org/draft-07/schema"

	server.RegisterTool(
		"hello",
		"Say hello to a person",
		func(arguments MyFunctionsArguments) (*mcp_golang.ToolResponse, error) {
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Hello, %s!", arguments.Submitter))), nil
		},
	)
	server.RegisterTool(
		"calculate",
		"Calculate two numbers",
		func(arguments CalculateArguments) (*mcp_golang.ToolResponse, error) {
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("A + B is %d", arguments.A+arguments.B))), nil
		},
	)

	server.RegisterTool(
		"fetch_data",
		"Fetch data from the internet",
		func(arguments FetchDataArguments) (*mcp_golang.ToolResponse, error) {
			fetch := js.Global().Get("fetch")
			if !fetch.Truthy() {
				return mcp_golang.NewToolResponse(mcp_golang.NewTextContent("fetch API not available")), nil
			}
			ch := make(chan string, 1)
			url := arguments.URL
			fetch.Invoke(url).Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				resp := args[0]
				resp.Call("text").Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
					ch <- args[0].String()
					return nil
				}))
				return nil
			}))
			result := <-ch
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(result)), nil
		},
	)

	js.Global().Set("handleMCPRequest", js.FuncOf(handleMCPRequest))
	select {}
}
